#!/usr/bin/env node

//! Chess.com (c) 2023

"use strict";

var runSpawnSync = require("child_process").spawnSync;
var runExecFileSync = require("child_process").execFileSync;
var params = getParams({booleans: ["no-chesscom", "debug-js", "h", "help", "help-all", "f", "force", "force-linking", "bin", "colors", "no-color", "no-minify", "v", "verbose", "no-simd", "grow-mem", "debug-wasm", "non-nested", "all", "skip-em-check", "single-threaded"]});
var args = ["build", "-j", require("os").cpus().length];
//var args = ["-j", require("os").cpus().length];
//var args = []; ///NOTE: Can't use multi-threading with emscripten_copy_files
var fs = require("fs");
var p = require("path");
var stockfishPath = p.join(__dirname, "src", "stockfish");
var stockfishWASMPath = p.join(__dirname, "src", "stockfish.wasm");
var stockfishWASMLoaderPath = p.join(__dirname, "src", "stockfish.js");
var stockfishWorkerThreadPath = p.join(__dirname, "src", "stockfish.worker.js");
var data;
var workerData;
var preface;
var postscript;
var buildToWASM;
var child;
var stockfishVersion = "16";
var expectedEmscripten = "2.0.26";
var fistRun;
var basename;
var buildingSingleThreaded = false;

function getParams(options, argv)
{
    var i,
        params = {_: []},
        last,
        len,
        match;
    
    if (Array.isArray(options)) {
        args = options;
        options = {};
    }
    
    options = options || {};
    
    if (!options.booleans) {
        options.booleans = [];
    }
    
    argv = argv || process.argv;
    
    len = argv.length;
    
    for (i = 2; i < len; i += 1) {
        if (argv[i][0] === "-") {
            if (argv[i][1] === "-") {
                last = argv[i].substr(2);
                match = last.match(/([^=]*)=(.*)/);
                if (match) {
                    last = match[1];
                    params[last] = match[2];
                    last = "";
                } else {
                    params[last] = true;
                }
            } else {
                /// E.g., -hav should indicate h, a, and v as TRUE.
                argv[i].split("").slice(1).forEach(function oneach(letter)
                {
                    params[letter] = true;
                    last = letter;
                });
            }
        } else if (last) {
            params[last] = argv[i];
            last = "";
        } else {
            params._.push(argv[i]);
            last = "";
        }
        /// Handle booleans.
        if (last && options.booleans.indexOf(last) > -1) {
            last = "";
        }
    }
    
    return params;
}

function minify(code)
{
    var initComment;
    if (params["no-minify"] || params["debug-wasm"]) {
        return code;
    }
    
    initComment = code.match(/\/\*![\s\S]*?\*\//)[0];
    
    return initComment + require("uglify-js").minify(code).code;
}

function color(color_code, str)
{
    if (!params["no-colors"] && (process.stdout.isTTY || params.colors)) {
        str = "\u001B[" + color_code + "m" + str + "\u001B[0m";
    }
    
    return str;
}

function warn(str)
{
    console.warn(color(33, "WARN: " + str));
}

function highlight(str)
{
    return color(33, str);
}

function note(str)
{
    return color(36, str);
}

function bold(str)
{
    return color(1, str);
}

function beep()
{
    if (process.stdout.isTTY && !params.s && !params.silent) {
        process.stdout.write("\u0007");
    }
}

function changeVersion(version)
{
    var filePath = p.join(__dirname, "src", "misc.cpp");
    var data = fs.readFileSync(filePath, "utf8");
    
    data = data.replace(/( version = ")[^\"]*(";)/, "$1" + version + "$2");
    
    try {
        fs.writeFileSync(filePath, data);
    } catch (e) {
        console.error(e);
    }
}

function determineBestArch()
{
    var cpuData = "";
    var cpuArch = "";
    var arch;
    
    try {
        cpuArch = execFileSync("uname", ["-m"], {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
    } catch (e) {}
    
    if (cpuArch === "i686" || cpuArch === "i386") {
        arch = "general-32";
    } else {
        if (cpuArch !== "x86_64" || cpuArch === "amd64") {
            warn("Unrecognized cpu architechure. Defaulting to x86_64.");
        }
        
        try {
            cpuData = execFileSync("cat", ["/proc/cpuinfo"], {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
        } catch (e) {}
        
        if (!cpuData) {
            try {
                cpuData = execFileSync("lscpu", {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
            } catch (e) {}
        }
        
        if (!cpuData) {
            try {
                cpuData = execFileSync("lshw", ["-C", "cpu"], {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
            } catch (e) {}
        }
        
        if (!cpuData) {
            try {
                /// FreeBSD & macOS?
                cpuData = execFileSync("sysctl", ["-a"], {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
            } catch (e) {}
        }
        
        if (/\bavx512\b/i.test(cpuData)) {
            arch = "x86-64-avx512";
        } else if (/\bbmi2\b/i.test(cpuData)) {
            arch = "x86-64-bmi2";
        } else if (/\bavx2\b/i.test(cpuData)) {
            arch = "x86-64-avx2";
        } else if (/\bpopcnt\b/i.test(cpuData)) {
            arch = "x86-64-modern";
        } else {
            arch = "general-64";
        }
    }
    
    console.log(note("Building " + arch));
    args.push("ARCH=" + arch);
}

function spawnSync(command, args, options)
{
    if (params.v || params.verbose) {
        console.log(highlight(" - Running command: " + command + " " + (args && args.length ? "\"" + args.join("\" \"") + "\"" : "")));
    }
    return runSpawnSync(command, args, options);
}

function execFileSync(command, args, options)
{
    if (params.v || params.verbose) {
        console.log(highlight(" - Running command: " + command + " " + (args && args.length ? "\"" + args.join("\" \"") + "\"" : "")));
    }
    return runExecFileSync(command, args, options);
}

function addNNSymLink()
{
    /// Adds NN symlink for testing code to use, if it doesn't exist already.
    try {
        var path = fs.readFileSync(p.join(__dirname, "src", "evaluate.h"), "utf8").match(/EvalFileDefaultName\s+["']([^"']+)/)[1];
        execFileSync("ln", ["-s", "../../" + path], {cwd: p.join(__dirname, "src", "emscripten", "public"), stdio: "pipe"});
    } catch (e) {
        if (!e.message || e.message.indexOf("File exists") === -1) {
            console.error("Creating symlink failed");
            console.error(e);
        }
    }
}

function checkEmscriptenVersion()
{
    var versionInfo;
    var exec = params.emcc || "emcc";
    try {
        versionInfo = execFileSync(exec, ["--version"], {encoding: "utf8", env: process.env, cwd: __dirname});
        if (versionInfo.indexOf(expectedEmscripten) === -1) {
            console.error(highlight("Warning:"));
            console.error("\nEmscripten version does not match.\nExpected " + note(expectedEmscripten) + ". See " + note(exec + " --version") + " for your currently installed version.");
            console.error("\n" + "To install the expected verions, try:\n\n  > " + note("emsdk install " + expectedEmscripten) + "\n  > " + note("emsdk activate " + expectedEmscripten));
            console.error("\nOr add " + note("--skip-em-check") + " to bypass this check.\n");
        }
    } catch (e) {
        console.error(e);
        console.error(highlight("Warning:"));
        console.error("\nCould not confirm emscripten version. Set your " + note("emcc") + " path with the " + note("--emcc") +" flag, or add " + not("--skip-em-check") + " to bypass this check.\n");
    }
}

function renameAndSymlink(origPath, newPath)
{
    fs.renameSync(origPath, newPath);
    fs.symlinkSync(newPath, origPath);
}

if (!params.make) {
    params.make = "make";
}

if (params.arch) {
    if (params.b || params.bin) {
        warn("Cannot user --bin (or -b) with --arch");
        process.exit(1);
    }
    
    args.push("ARCH=" + params.arch);
    if (params.arch === "wasm") {
        buildToWASM = true;
    }
} else if (params.b || params.bin) {
    determineBestArch()
} else {
    buildToWASM = true;
    params.arch = "wasm";
    args.push("ARCH=wasm");
}

if (params.help || params["help-all"] || params.h) {
    console.log("");
    console.log(bold("Build the Stockfish Chess Engine"));
    console.log("Usage: ./build.js [" + highlight("options") + "]");
    console.log("");
    console.log("  " + highlight("--all") + "             Build all flavors of emscripten engines");
    console.log("  " + highlight("-f --force") + "        Always rebuild the entire project");
    console.log("  " + highlight("--force-linking") + "   Always preforming the final linking step");
//    console.log("  " + highlight("--variants") + "      Comma separated list of variants to include (default: " + note("none") + ")");
//    console.log(                     "                  Possible values are " + note("all") + ", " + note("none") + " (no variants, except for Chess960),");
//    console.log(                     "                  " + note("anti") + ", " + note("atomic") + ", " + note("crazyhouse") + ", " + note("horde") + ", " + note("kingofthehill") + ", " + note("race") + ", " + note("relay") + ", or " + note("3check"));
    console.log("  " + highlight("--no-chesscom") + "     Disable changes made specifically for Chess.com");
    console.log("  " + highlight("--static") + "          Link libaries statically (not avaiable for WASM)");
    console.log("  " + highlight("--debug-wasm") + "      Compile WASM in debug mode (adds ASSERTIONS=2 and SAFE_HEAP=1)");
    console.log("  " + highlight("--no-minify") + "       Disable closure compiler of JS code");
    console.log("  " + highlight("--no-simd") + "         Compile without WASM SIMD");
    console.log("  " + highlight("--grow-mem") + "        Allow WASM memory to grow (might be less performant, not sure)");
    console.log("  " + highlight("--non-nested") + "      Do not proxy to threads in WASM (for Chrome 109 only)");
    console.log("  " + highlight("--arch") + "            Architecture to build to (default: " + note("wasm") + ")");
    console.log(                     "                    See " + highlight("--help-all") + " for more options, or use " + highlight("--bin") + " instead");
    console.log("  " + highlight("--basename") + "        The filename for the engine (default: " + note ("stockfish") + ")");
    console.log(                     "                    This will not only rename the files, it will also rewrite the base JS file");
    console.log(                     "                    to load the correct WASM engine");
    console.log("  " + highlight("--bin") + "             Attempt to build a binary engine that is the most suitable for this system");
    console.log("  " + highlight("--make") + "            Path to program used to make Stockfish (default: " + note("make") + ")");
    console.log("  " + highlight("--comp") + "            Compiler to build C code with");
    console.log("  " + highlight("--compcxx") + "         Compiler to build C++ code with");
    console.log("  " + highlight("--version") + "         Specify Stockfish version number (default: " + note(stockfishVersion) + ")");
    console.log(                     "                    Use " + note("date") + " to use the current date");
    console.log(                     "                    Use " + note("timestamp") + " to use the current Unix timestamp");
    console.log(                     "                    Use " + note("hash") + " to use the current git commit hash");
    console.log("  " + highlight("--single-threaded") + " Compile the engine without pthreads");
    console.log("  " + highlight("--skip-em-check") + "   Do not check Emscripten version (expected version: " + note(expectedEmscripten) + ")");
    console.log("  " + highlight("--emcc") + "            Path to " + note("emcc") + " (used to ensure version compatibility)");
    console.log("  " + highlight("--colors") + "          Always colorize the output, even through a pipe");
    console.log("  " + highlight("--no-colors") + "       Never colorize the output");
    console.log("  " + highlight("-v --verbose") + "      Print extra info");
    console.log("  " + highlight("-h --help") + "         Show build.js's help");
    console.log("  " + highlight("--help-all") + "        Show Stockfish's Makefile help as well");
    console.log("");
    console.log("Examples:");
    console.log("");
    console.log("  Default: include Chess.com modifications and compile to WASM");
    console.log("    ./build.js");
    console.log("");
    console.log("  Vanilla Stockfish: no modifications, no variants, native binary");
    console.log("    ./build.js " + highlight("--no-chesscom") + " " + highlight("--bin"));
    console.log("");
    if (params["help-all"]) {
        console.log("");
        console.log(bold("******** Makefile Help ********"));
        console.log("");
        spawnSync(params.make, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
    }
    process.exit();
}

if (!params["skip-em-check"]) {
    checkEmscriptenVersion();
}

if (params.all) {
    (function ()
    {
        var newArgs = [process.argv[1], "-f", "--skip-em-check"];
        Object.keys(params).forEach(function (key)
        {
            var val = params[key];
            var flag;
            if (key === "all" || key === "basename" || key === "no-simd" || key === "non-nested" || key === "arch" || key === "_") {
                return;
            }
            if (key.length === 1) {
                flag = "-" + key;
            } else {
                flag = "--" + key;
            }
            if (val === true) {
                newArgs.push(flag)
            } else {
                newArgs.push(flag, val);
            }
        });
        if (params._ && params._.length) {
            newArgs = newArgs.concat(params._);
        }
        
        console.log(highlight(" -- (1/4) Building non-nested worker multithreaded engine..."));
        spawnSync(process.execPath, newArgs.concat(["--non-nested"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        console.log(highlight(" -- (2/4) Building non-simd multithreaded engine..."));
        spawnSync(process.execPath, newArgs.concat(["--no-simd"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        console.log(highlight(" -- (3/4) Building single-threaded engine..."));
        spawnSync(process.execPath, newArgs.concat(["--single-threaded"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        console.log(highlight(" -- (4/4) Building standard multithreaded engine..."));
        spawnSync(process.execPath, newArgs.concat(["--basename=stockfish-nnue-" + stockfishVersion]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        console.log(highlight(" -- Finished building all engines"));
        process.exit();
    }());
}

if (typeof params.basename === "string") {
    basename = params.basename.replace(/\.(?:js|wasm)$/i, "");
}

if (params.force || params.f) {
    args.push("--always-make");
} else if (params["force-linking"]) {
    ///NOTE: --force will also link as well, so both are not needed.
    if (buildToWASM) {
        try {
            fs.unlinkSync(stockfishJSWASMPath);
        } catch (e) {}
        try {
            fs.unlinkSync(stockfishJSWASMLoaderPath);
        } catch (e) {}
        if (basename) {
            try {
                fs.unlinkSync(p.join(__dirname, "src", basename + ".js"));
            } catch (e) {}
        }
    } else {
        try {
            fs.unlinkSync(stockfishPath);
        } catch (e) {}
    }
}
/*
if (params.variants && params.variants.toLowerCase() !== "all") {
    args.push("VARIANTS=" + params.variants.toUpperCase());
} else if (!params.variants) {
    args.push("VARIANTS=NONE");
}
*/

if (!params["no-chesscom"]) {
    args.push("CHESSCOM=1");
}


if (params["no-minify"]) {
    args.push("NOJSMINIFY=yes");
}
if (params["no-simd"]) {
    args.push("wasm_simd_post_mvp=no");
    args.push("wasm_simd=no");
    args.push("WASMLOWMEM=yes");
    if (!basename) {
        basename = "stockfish-nnue-" + stockfishVersion + "-no-simd";
    }
} else {
    args.push("wasm_simd_post_mvp=yes");
}
if (params["grow-mem"]) {
    args.push("WASMGROWMEM=yes");
}
if (params["non-nested"]) {
    args.push("WASMNONNESTED=yes");
    if (!basename) {
        basename = "stockfish-nnue-" + stockfishVersion + "-no-Worker";
    }
}
if (params["single-threaded"]) {
    buildingSingleThreaded = true;
    args.push("use_wasm_pthreads=no");
    args.push("wasm_simd_post_mvp=no");
    args.push("wasm_simd=no");
    args.push("WASMNONNESTED=no");
    if (!basename) {
        basename = "stockfish-nnue-" + stockfishVersion + "-single";
    }
}

if (params["debug-wasm"]) {
    if (buildToWASM) {
        args.push("DEBUGWASM=1");
        args.push("optimize=no");
    } else {
        warn("Ignoring --debug-wasm");
    }
}

/*
if (params.simd) {
    args.push("SIMD=1");
}
*/
/*
if (params.static) {
    if (buildToJs) {
        warn("Ignoring --static");
    } else {
        args.push("STATIC=1");
    }
}
*/

if (params.comp) {
    args.push("COMP=" + params.comp);
}
if (params.compcxx) {
    args.push("COMPCXX=" + params.compcxx);
}

if (String(params.version).toLowerCase() === "timestamp") {
    params.version = Date.now();
}

if (String(params.version).toLowerCase() === "hash") {
    params.version = execFileSync("git", ["rev-parse", "--short=0", "HEAD"], {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
}

///NOTE: Stockfish will insert the date automatically if no version number is given.
if (String(params.version).toLowerCase() !== "date") {
    changeVersion(params.version === true || !params.version ? stockfishVersion : params.version);
}

if (buildToWASM) {
    child = spawnSync(params.make, ["-C", ".."].concat(args), {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src", "emscripten")});
    // ///TODO: Just do "build"
    //child = spawnSync(params.make, ["-C", "..", "emscripten_build", "wasm_simd_post_mvp=yes"].concat(args), {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src", "emscripten")});
} else {
    child = spawnSync(params.make, args, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
    //child = spawnSync(params.make, ["build"].concat(args), {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
}

/// Reset version string.
if (String(params.version).toLowerCase() !== "date") {
    changeVersion("dev");
}

/// `make` does not throw an error when encountering errors, so we need to do that manually.
if (Number(child.status) !== 0) {
    process.exit(Number(child.status));
}

if (!buildToWASM && basename) {
    fs.renameSync(stockfishPath, p.join(__dirname, "src", basename));
}


if (buildToWASM) {
    data = fs.readFileSync(stockfishWASMLoaderPath, "utf8");
    if (!buildingSingleThreaded) {
        workerData = fs.readFileSync(stockfishWorkerThreadPath, "utf8").trim();
        
        try {
            fs.unlinkSync(stockfishWorkerThreadPath);
        } catch (e) {};
        
        if (params["debug-wasm"]) {
            data = "//HACK: This build requires some hacks to run\nif (typeof global === 'undefined') {\n    if (typeof window !== 'undefined') { window.global=window }\n    else { self.global=self }\n}\nglobal.ENVIRONMENT_IS_FETCH_WORKER=true;global.indexedDB={open:function(){return{}}};\n" + data;
        }
    }
    
    if (!buildingSingleThreaded) {
        /// Append the hacky custom post message code for the asyncify.
        workerData += "\n" + fs.readFileSync(p.join(__dirname, "src", "emscripten", "worker-postamble.js"), "utf8").trim();
        /// Run the init function instead of using emscripten's ugly importScripts hack.
        ///NOTE: Could remove other ugly hacks.
        workerData = workerData.replace(/if\s*\([^)]+urlOrBlob[\s\S]*?else\s*\{[^}]+\}/, "Stockfish=INIT_ENGINE();");
        data = data.replace("/// Insert worker here", workerData).trim();
    }
    
    /// Prevent throwing on 0 exit code.
    data = data.replace(/(function\s*[a-zA-Z0-9]*)\(([^,)]+),([^)]+)\)\s*\{\s*throw\s*\3/, "$1($2,$3){if($2!==0)throw $3");
    
    /// Prevent errors when exiting.
    data = data.replace(/(apply[^{}]+})\s*finally/, "$1catch(e){if(e.message.indexOf(\"unreachable\")===-1)throw e}finally");
    
    data = data.replace("__YEAR__", (new Date()).getFullYear());
    data = data.replace("__VERSION__", stockfishVersion);
    
    
    if (params["non-nested"]) {
        if (params["debug-wasm"]) {
            /// Replace safeSetTimeout()'s setTimeout() with setImmediate() in --debug-wasm mode.
            data = data.replace(/(function\s+safeSetTimeout[\s\S]+?)setTimeout/, "$1quickTimeout");
        } else {
            /// Replace safeSetTimeout()'s setTimeout() with setImmediate() in regular mode.
            data = data.replace(/;\s*setTimeout\s*\(\s*function\s*\(\s*\)/, ";quickTimeout(function()");
        }
    }
        
    
    if (basename) {
        data = data.replace(/(["'])stockfish.wasm["']/g, function (full, quote)
        {
            return quote + basename + ".wasm" + quote;
        });
    }
    
    data = minify(data);
    
    fs.writeFileSync(stockfishWASMLoaderPath, data);
    
    if (basename) {
        renameAndSymlink(stockfishWASMLoaderPath, p.join(__dirname, "src", basename + ".js"));
        renameAndSymlink(stockfishWASMPath, p.join(__dirname, "src", basename + ".wasm"));
        try {
            renameAndSymlink(stockfishWASMPath + ".map", p.join(__dirname, "src", basename + ".wasm" + ".map"));
        } catch (e) {}
    }
    
    addNNSymLink();
}

beep();
