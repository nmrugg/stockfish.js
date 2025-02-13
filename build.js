#!/usr/bin/env node

//! Chess.com (c) 2025

"use strict";

var runSpawnSync = require("child_process").spawnSync;
var runExecFileSync = require("child_process").execFileSync;
var params = getParams({booleans: [
    "no-chesscom", "h", "help", "help-all", "f", "force", "force-linking", "s", "silent", "bin", "colors", "no-color", "no-minify", "v", "verbose", "debug-wasm", "all", "skip-em-check", "single-threaded", "lite", "ultra-lite", "wasm-debug", "asm-js", "keep-syzygy", "hash", "no-split",
    "skip-asm", "skip-single", "skip-lite", "skip-single-lite", "skip-lite-single", "skip-standard",
    "only-asm", "only-single", "only-lite", "only-single-lite", "only-lite-single", "only-standard",
    "debug",
    "do-not-verify-nets",
]});
var args = ["-j", require("os").cpus().length];
var fs = require("fs");
var p = require("path");
var srcPath = p.join(__dirname, "src");
var stockfishPath = p.join(srcPath, "stockfish");
var stockfishWASMPath = p.join(srcPath, "stockfish.wasm");
var wasmEmbeddedNetsPath;
var data;
var workerData;
var preface;
var postscript;
var buildWithEmscripten;
var child;
var stockfishVersionNumber = "17";
var expectedEmscripten = "3.1.7";
var fistRun;
var basename;
var buildingSingleThreaded = false;
var builtFiles = [];

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
    
    try {
        code = initComment + require("uglify-js").minify(code).code;
    } catch (e) {
        warn("Unable to minify JS");
    }
    
    return code;
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

function determineBestArch()
{
    var cpuData = "";
    var cpuArch = "";
    var arch;
    
    try {
        cpuArch = execFileSync("uname", ["-m"], {encoding: "utf8", env: process.env, cwd: __dirname}).trim();
    } catch (e) {}
    
    if (cpuArch === "i686" || cpuArch === "i386") {
        arch = "x86-32";
    } else if (cpuArch === "armv7l") {
        arch = "armv7";
    } else if (cpuArch === "armv8l") {
        arch = "armv8";
    } else if (cpuArch === "arm64") {
        arch = "apple-silicon";
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
        
        if (/\bvnni512\b/i.test(cpuData)) {
            arch = "x86-64-vnni512";
        } else if (/\bvnni256\b/i.test(cpuData)) {
            arch = "x86-64-vnni256";
        } else if (/\bavx512\b/i.test(cpuData)) {
            arch = "x86-64-avx512";
        } else if (/\bavxvnni\b/i.test(cpuData)) {
            arch = "x86-64-avxvnni";
        } else if (/\bbmi2\b/i.test(cpuData)) {
            arch = "x86-64-bmi2";
        } else if (/\bavx2\b/i.test(cpuData)) {
            arch = "x86-64-avx2";
        } else if (/\bpopcnt\b/i.test(cpuData) && /\bsse4_?1\b/i.test(cpuData)) {
            arch = "x86-64-sse41-popcnt";
        } else if (/\bssse3\b/i.test(cpuData)) {
            arch = "x86-64-ssse3";
        } else if (/\bpopcnt\b/i.test(cpuData) && /\bsse3\b/i.test(cpuData)) {
            arch = "x86-64-sse3-popcnt";
        } else {
            arch = "x86-64";
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
        console.error("\nCould not confirm emscripten version. Set your " + note("emcc") + " path with the " + note("--emcc") +" flag, or add " + note("--skip-em-check") + " to bypass this check.\n");
    }
}

function ensureNets()
{
    var args = ["net"];
    if (params.lite) {
        args.push("LITE_NET=yes");
    } else if (params["ultra-lite"]) {
        args.push("ULTRA_LITE_NET=yes");
    }
    
    execFileSync(params.make, args, {cwd: srcPath});
}
function getNetPaths()
{
    var filename;
    if (params["ultra-lite"]) {
        filename = "ultra_lite_nets.h";
    } else if (params.lite) {
        filename = "lite_nets.h";
    } else {
        filename = "evaluate.h";
    }
    var code = fs.readFileSync(p.join(srcPath, filename), "utf8");
    var match;
    var nets = [];
    
    match = code.match(/\#define EvalFileDefaultNameBig "([^"]+)"/);
    if (match) {
        nets.push({path: match[1], type: "Big"});
    } else {
        console.error("Cannot find EvalFileDefaultNameBig path");
    }
    match = code.match(/\#define EvalFileDefaultNameSmall "([^"]*)"/);
    if (match) {
        nets.push({path: match[1], type: "Small"});
    } else {
        console.error("Cannot find EvalFileDefaultNameSmall path");
    }
    
    return nets;
}

function alreadyEmbedded(nets)
{
    var data;
    var i;
    
    try {
        data = fs.readFileSync(wasmEmbeddedNetsPath, "utf8");
    } catch (e) {
        return false;
    }
    
    for (i = nets.length - 1; i >= 0; --i) {
        if (!params.lite || params["ultra-lite"] || nets[i].type !== "small") {
            if (data.indexOf(nets[i].path) === -1) {
                return false;
            }
        }
    }
    return true;
}

function embedNet(outputPath, net)
{
    /// Read nets or create an empty net for the small net in Lite mode.
    var data = net.path ? fs.readFileSync(p.join(srcPath, net.path)) : Buffer.alloc(1);
    var out = "";
    var prefix = "// Generated from " + net.path + " on " + (new Date).toString() + "\n";
    var netVarBase = "gEmbeddedNNUE" + net.type;
    var len = data.byteLength;
    var i;
    var char;
    
    fs.appendFileSync(outputPath, prefix + "extern const unsigned char " + netVarBase + "Data[] = \"\\\n");
    
    for (i = 0; i < len; ++i) {
        char = data[i].toString(16);
        if (data[i] < 16) {
            char = "0" + char;
        }
        
        out += "\\x" + char;
        
        if ((i + 1) % 32 === 0) {
            out += "\\\n";
            if (((i + 1) / 32) % 10000 === 0) {
                fs.appendFileSync(outputPath, out);
                out = "";
            }
        }
    }
    
    fs.appendFileSync(outputPath, out + "\";\n" +
        "extern const unsigned int " + netVarBase + "Size = " + len + ";\n" +
        "extern const unsigned char* const " + netVarBase + "End = &" + netVarBase + "Data[" + len + "];" + /// Oddly, Stockfish seems to never actually use this variable.
        "\n\n");
}

function embedNets()
{
    var nets = getNetPaths();
    
    if (!nets.length) {
        throw new Error("Cannot find any networks to embed.");
    }
    
    /// First, make sure the nets are here.
    if (!params["do-not-verify-nets"]) {
        ensureNets();
    }
    
    if (!alreadyEmbedded(nets)) {
        fs.writeFileSync(wasmEmbeddedNetsPath, "");
        nets.forEach(function (net)
        {
            if (net.path) {
                console.log(note("Embedding " + net.path));
            }
            embedNet(wasmEmbeddedNetsPath, net);
        });
    }
}

function makeRelative(from, to)
{
    var relDirPath = p.relative(p.dirname(from), p.dirname(to));
    var relPath = p.join(relDirPath, p.basename(to));
    if (!p.isAbsolute(relPath) && relPath.substr(0, 3) !== "../") {
        relPath = "./" + relPath;
    }
    return relPath;
}

function renameAndSymlink(origPath, newPath)
{
    fs.renameSync(origPath, newPath);
    makeSymLink(newPath, origPath);
}

function makeSymLink(newPath, origPath)
{
    fs.symlinkSync(makeRelative(origPath, newPath), origPath);
    builtFiles.push(newPath);
}

function fillInBlanks(code)
{
    code = code.replace("__YEAR__", (new Date()).getFullYear());
    code = code.replace("__VERSION__", stockfishVersionNumber);
    return code;
}

function fixUpWASMBuild()
{
    var stockfishWASMLoaderPath = p.join(srcPath, "stockfish.js");
    var stockfishWorkerThreadPath = p.join(srcPath, "stockfish.worker.js");
    var workerExternPostPath = p.join(srcPath, "emscripten", "worker-extern-post.js");
    var workerExternPostData = fs.readFileSync(workerExternPostPath, "utf8");
    var workerData = "";
    var stockfishWASMLoaderData;
    var hashParts;
    var finalWasmPath = stockfishWASMPath;
    
    if (!params["single-threaded"]) {
        workerData = fs.readFileSync(stockfishWorkerThreadPath, "utf8") + workerExternPostData;
        try {
            fs.unlinkSync(stockfishWorkerThreadPath);
        } catch (e) {}
    }
    stockfishWASMLoaderData = fs.readFileSync(stockfishWASMLoaderPath, "utf8").replace(/\/\/\/ Insert worker here/, workerData);
    stockfishWASMLoaderData = fillInBlanks(stockfishWASMLoaderData);
    stockfishWASMLoaderData = minify(stockfishWASMLoaderData);
    fs.writeFileSync(stockfishWASMLoaderPath, stockfishWASMLoaderData);
    if (!basename && params.hash) {
        basename = "stockfish";
    }
    if (basename) {
        /// The hash for all files is the combined hash of both the JS and the WASM.
        /// This makes it clear where the WASM file is located based on the JS file's string.
        /// That way, we don't have to tell the JS where the WASM file is located.
        hashParts = getHashPart([stockfishWASMLoaderPath, stockfishWASMPath]);
        finalWasmPath = p.join(srcPath, basename + hashParts + ".wasm");
        renameAndSymlink(stockfishWASMLoaderPath, p.join(srcPath, basename + hashParts) + ".js");
        renameAndSymlink(stockfishWASMPath, finalWasmPath);
        if (params["debug-wasm"]) {
            try {
                renameAndSymlink(stockfishWASMPath + ".map", p.join(srcPath, basename + hashParts + ".wasm.map"));
            } catch (e) {}
        }
    } else {
        builtFiles.push(stockfishWASMLoaderPath, stockfishWASMPath);
        if (params["debug-wasm"]) {
            builtFiles.push(stockfishWASMLoaderPath, stockfishPath + ".wasm.map");
        }
    }
    if (params.split && !params["no-split"]) {
        splitFile(finalWasmPath, params.split);
        fs.unlinkSync(p.join(stockfishWASMPath));
    }
    
    console.log("Built " + note(p.basename(finalWasmPath, ".wasm") + ".js"));
}

function splitFile(path, count)
{
    var data = fs.readFileSync(path);
    ///NOTE: We round up to make sure we get all of the bytes on the last parts
    var chunkSize = Math.ceil(data.byteLength / count);
    var i;
    var at;
    var ext = p.extname(path);
    var basename = path.slice(0, -ext.length);
    var newPath;
    var origPath;
    
    for (i = 0; i < count; ++i) {
        at = i * chunkSize;
        newPath = basename + "-part-" + i + ext;
        fs.writeFileSync(newPath, data.slice(at, chunkSize + at));
        origPath = p.join(srcPath, "stockfish-part-" + i + ext);
        makeSymLink(newPath, origPath);
    }
    fs.unlinkSync(path);
    if (builtFiles.indexOf(path) > -1) {
        builtFiles.splice(builtFiles.indexOf(path), 1);
    }
}

function fixUpASMJSBuild()
{
    var enginePath = p.join(srcPath, "stockfish.js");
    var engineData = fs.readFileSync(enginePath, "utf8");
    engineData = fillInBlanks(engineData);
    engineData = minify(engineData);
    fs.writeFileSync(enginePath, engineData);
    if (basename) {
        renameAndSymlink(enginePath, p.join(srcPath, basename + getHashPart(enginePath) + ".js"));
    } else {
        builtFiles.push(enginePath);
    }
}

function getVersion()
{
    var version = params.version === "string" ? params.version : stockfishVersionNumber;
    if (buildWithEmscripten) {
        if (params["ultra-lite"]) {
            version += " Ultra Lite";
        } else if (params.lite) {
            version += " Lite";
        }
        if (!params["asm-js"]) {
            version += " WASM";
        } else {
            version += " ASM.JS";
        }
        if (!params["single-threaded"]) {
            version += " Multithreaded";
        }
    }
    
    return version;
}

function hashData(data)
{
    var crypto = require("crypto");
    var hash = crypto.createHash("md5");
    hash.setEncoding("hex");
    hash.write(data);
    hash.end();
    return hash.read().substr(0, 7);
}

function hashFiles(paths)
{
    var data = Buffer.alloc(0);
    if (!Array.isArray(paths)) {
        paths = [paths];
    }
    paths.forEach(function (path)
    {
        data = Buffer.concat([data, fs.readFileSync(path)]);
    });
    return hashData(data);
}

function getHashPart(paths)
{
    if (!params.hash) {
        return "";
    }
    return "-" + hashFiles(paths);
}

function moveBuiltFiles()
{
    var i;
    var len = builtFiles.length;
    var basename;
    for (i = 0; i < len; ++i) {
        basename = p.basename(builtFiles[i]);
        renameAndSymlink(builtFiles[i], p.join(params["output-dir"], basename));
    }
}

if (params["wasm-debug"]) { /// alias
    params["debug-wasm"] = params["wasm-debug"];
}

if (params.debug) {
    if (buildWithEmscripten) {
        params["debug-wasm"] = true;
    } else {
        args.push("debug=yes");
    }
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
        buildWithEmscripten = true;
    }
} else if (params.b || params.bin) {
    determineBestArch()
} else {
    buildWithEmscripten = true;
    params.arch = "wasm";
    args.push("ARCH=wasm");
}

if (params["asm-js"]) {
    args.push("ASMJS=yes");
    if (!params.lite) {
        if (params["lite"] !== "0" && params["lite"] !== "false") {
            params["lite"] = true;
        }
    }
    params["single-threaded"] = true;
}

if (params.split && typeof params.split === "boolean") {
    params.split = 6;
}

if (params.help || params["help-all"] || params.h) {
    console.log("");
    console.log(bold("Build the Stockfish Chess Engine"));
    console.log("Usage: ./build.js [" + highlight("options") + "]");
    console.log("");
    console.log("  " + highlight("--all") + "              Build all flavors of emscripten engines");
    console.log("  " + highlight("--arch") + "             Architecture to build to (default: " + note("wasm") + ")");
    console.log(                     "                     See " + highlight("--help-all") + " for more options, or use " + highlight("--bin") + " instead");
    console.log("  " + highlight("--asm-js") + "           Build the ASM.JS version");
    console.log("  " + highlight("--basename") + "         The filename for the engine (default: " + note ("stockfish") + ")");
    console.log(                     "                     This will not only rename the files, it will also rewrite the base JS file");
    console.log(                     "                     to load the correct WASM engine");
    console.log("  " + highlight("--bin") + "              Attempt to build a binary engine that is the most suitable for this system");
    console.log("  " + highlight("--colors") + "           Always colorize the output, even through a pipe");
    console.log("  " + highlight("--comp") + "             Compiler to build C code with");
    console.log("  " + highlight("--compcxx") + "          Compiler to build C++ code with");
    console.log("  " + highlight("--debug-wasm") + "       Compile WASM in debug mode");
    console.log("  " + highlight("--do-not-verify-nets") + " Do not attempt to download or verify the net files");
    console.log("  " + highlight("--emcc") + "             Path to " + note("emcc") + " (used to ensure version compatibility)");
    console.log("  " + highlight("-f --force") + "         Always rebuild the entire project");
    console.log("  " + highlight("--force-linking") + "    Always preforming the final linking step");
    console.log("  " + highlight("--hash") + "             Add a hash to the filename");
    console.log("  " + highlight("-h --help") + "          Show build.js's help");
    console.log("  " + highlight("--help-all") + "         Show Stockfish's Makefile help as well");
    console.log("  " + highlight("--keep-syzygy") + "      Do not remove syzygy code");
    console.log("  " + highlight("--lite") + "             Embed small net file");
    console.log("  " + highlight("--make") + "             Path to program used to make Stockfish (default: " + note("make") + ")");
    console.log("  " + highlight("--no-colors") + "        Never colorize the output");
    console.log("  " + highlight("--no-minify") + "        Minification of outer JS code (use " + highlight("--debug-wasm") + " to completely disable minfication)");
    console.log("  " + highlight("--no-split") + "         Disable WASM splitting, even if " + highlight("--split") + " is present");
    console.log("  " + highlight("--only-asm") + "         Only build the ASM.JS engine with " + highlight("--all"));
    console.log("  " + highlight("--only-lite") + "        Only build lite multi-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--only-lite-single") + " Only build lite single-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--only-single") + "      Only build non-lite single-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--only-standard") + "    Only build standard, multi-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("-s --silent") + "        Do not beep");
    console.log("  " + highlight("--single-threaded") + "  Compile the engine without Pthreads");
    console.log("  " + highlight("--skip-asm") + "         Do not build the ASM.JS engine with " + highlight("--all"));
    console.log("  " + highlight("--skip-em-check") + "    Do not check Emscripten version (expected version: " + note(expectedEmscripten) + ")");
    console.log("  " + highlight("--skip-lite") + "        Do not build lite multi-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--skip-lite-single") + " Do not build lite single-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--skip-single") + "      Do not build non-lite single-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--skip-standard") + "    Do not build standard, multi-threaded engine with " + highlight("--all"));
    console.log("  " + highlight("--split") + "=" + note("count") + "      Split up WASM binary how many parts");
    console.log("  " + highlight("--ultra-lite") + "       Embed even smaller net file");
    console.log("  " + highlight("-v --verbose") + "       Print extra info");
    console.log("  " + highlight("--version") + "          Specify Stockfish version number (default: " + note(stockfishVersionNumber) + ")");
    
    console.log("");
    console.log("Examples:");
    console.log("");
    console.log("  Default: build the multi-threaded WASM engine");
    console.log("    ./build.js");
    console.log("");
    console.log("  Build all emscripten engine flavors");
    console.log("    ./build.js " + highlight("--all"));
    console.log("");
    console.log("  Build Native binary Stockfish");
    console.log("    ./build.js " + highlight("--bin"));
    console.log("");
    if (params["help-all"]) {
        console.log("");
        console.log(bold("******** Makefile Help ********"));
        console.log("");
        spawnSync(params.make, {stdio: [0,1,2], env: process.env, cwd: srcPath});
    }
    process.exit();
}

if (buildWithEmscripten && !params["skip-em-check"]) {
    checkEmscriptenVersion();
}

if (params.all) {
    (function ()
    {
        var hasOnlyFlag = params["only-asm"] || params["only-single"] || params["only-lite"] || params["only-standard"] || params["only-lite-single"] || params["only-single-lite"];
        
        function removeOld(type)
        {
            fs.readdirSync(srcPath).forEach(function (path)
            {
                var regex = new RegExp("^stockfish-\\d+(?:.\\d+)?-?" + type + "-[a-f0-9]+(?:-part-\\d+)?\\.(?:wasm(?:\.map)?|js)$", "i");
                if (regex.test(path) || /^stockfish(?:-part-\d+)?\.(?:js|wasm(?:\.map)?)$/.test(path)) {
                    fs.unlinkSync(p.join(srcPath, path));
                }
            });
        }
        
        var newArgs = [process.argv[1], "--force", "--skip-em-check", "--silent"];
        Object.keys(params).forEach(function (key)
        {
            var val = params[key];
            var flag;
            if (key === "all" || key === "lite" || key === "ultra-lite" || key === "basename" || key === "no-simd" || key === "non-nested" || key === "arch" || key === "_") {
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
        
        console.log(highlight(" -- (1/5) Building ASM-JS engine..."));
        if (!params["skip-asm"] && (!hasOnlyFlag || params["only-asm"])) {
            removeOld("-asm");
            spawnSync(process.execPath, newArgs.concat(["--asm-js", "--no-split"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        } else {
            console.log(note("  Skipping..."));
        }
        console.log(highlight(" -- (2/5) Building Single-threaded Lite engine..."));
        if (!params["skip-lite-single"] && !params["skip-single-lite"] && (!hasOnlyFlag || params["only-lite-single"] || params["only-single-lite"])) {
            removeOld("-lite-single");
            spawnSync(process.execPath, newArgs.concat(["--lite", "--single-threaded", "--no-split"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        } else {
            console.log(note("  Skipping..."));
        }
        console.log(highlight(" -- (3/5) Building Multi-threaded Lite engine..."));
        if (!params["skip-lite"] && (!hasOnlyFlag || params["only-lite"])) {
            removeOld("-lite");
            spawnSync(process.execPath, newArgs.concat(["--lite", "--no-split"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        } else {
            console.log(note("  Skipping..."));
        }
        console.log(highlight(" -- (4/5) Building Single-threaded Standard engine..."));
        if (!params["skip-single"] && (!hasOnlyFlag || params["only-single"])) {
            removeOld("-single");
            spawnSync(process.execPath, newArgs.concat(["--single-threaded"]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        } else {
            console.log(note("  Skipping..."));
        }
        console.log(highlight(" -- (5/5) Building Multi-threaded Standard engine..."));
        if (!params["skip-standard"] && (!hasOnlyFlag || params["only-standard"])) {
            removeOld("");
            spawnSync(process.execPath, newArgs.concat(["--basename=stockfish-" + stockfishVersionNumber]), {encoding: "utf8", env: process.env, cwd: __dirname, stdio: [0,1,2]});
        } else {
            console.log(note("  Skipping..."));
        }
        console.log(highlight(" -- Finished building all engines"));
        beep();
        process.exit();
    }());
}

if (typeof params.basename === "string") {
    basename = params.basename.replace(/\.(?:js|wasm)$/i, "");
}

if (params.force || params.f) {
    args.push("--always-make");
    //execFileSync(params.make, ["clean"], {stdio: "pipe", env: process.env, cwd: srcPath});
} else if (params["force-linking"]) {
    ///NOTE: --force will also link as well, so both are not needed.
    if (buildWithEmscripten) {
        try {
            fs.unlinkSync(stockfishJSWASMPath);
        } catch (e) {}
        try {
            fs.unlinkSync(stockfishJSWASMLoaderPath);
        } catch (e) {}
        if (basename) {
            try {
                fs.unlinkSync(p.join(srcPath, basename + ".js"));
            } catch (e) {}
        }
    } else {
        try {
            fs.unlinkSync(stockfishPath);
        } catch (e) {}
    }
}

if (params["no-minify"]) {
    args.push("NOJSMINIFY=yes");
}

if (!basename && params["asm-js"]) {
    basename = "stockfish-" + stockfishVersionNumber + "-asm";
}
if (!basename && params["ultra-lite"] && params["single-threaded"]) {
    basename = "stockfish-" + stockfishVersionNumber + "-ultra-lite-single";
}
if (!basename && params.lite && params["single-threaded"]) {
    basename = "stockfish-" + stockfishVersionNumber + "-lite-single";
}

if (params.lite) {
    args.push("LITE_NET=yes");
    if (!basename) {
        basename = "stockfish-" + stockfishVersionNumber + "-lite";
    }
}
if (params["ultra-lite"]) {
    args.push("ULTRA_LITE_NET=yes");
    if (!basename) {
        basename = "stockfish-" + stockfishVersionNumber + "-ultra-lite";
    }
}

if (params["single-threaded"]) {
    buildingSingleThreaded = true;
    args.push("WASM_SINGLE_THREADED=yes");
    if (!basename) {
        basename = "stockfish-" + stockfishVersionNumber + "-single";
    }
}

if (params["debug-wasm"]) {
    if (buildWithEmscripten) {
        args.push("WASM_DEBUG=yes");
        try {
            fs.unlinkSync(stockfishWASMPath + ".map");
        } catch (e) {}
    } else {
        warn("Ignoring --debug-wasm");
    }
}


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


if (params["ultra-lite"]) {
    wasmEmbeddedNetsPath = "wasm_embedded_ultra_lite_network.h";
} else if (params.lite) {
    wasmEmbeddedNetsPath = "wasm_embedded_lite_network.h";
} else {
    wasmEmbeddedNetsPath = "wasm_embedded_networks.h";
}
wasmEmbeddedNetsPath = p.join(srcPath, "emscripten", wasmEmbeddedNetsPath);

if (buildWithEmscripten && !params["keep-syzygy"]) {
    args.push("NO_SYZYGY=yes");
}

args.push("ENGINE_VERSION=\"" + getVersion() + "\"");

if (params["do-not-verify-nets"]) {
    args.push("NO_VERIFY_NETS=yes");
}

if (buildWithEmscripten) {
    args.push("build");
    embedNets();
} else {
    if (params.debug) {
        args.push("build");
    } else {
        args.push("profile-build");
    }
}

if (params.split && !params["no-split"]) {
    args.push("SPLIT_WASM=yes");
    args.push("WASM_SPLIT_COUNT=" + params.split);
}

///
/// Build
///
child = spawnSync(params.make, args, {stdio: [0,1,2], env: process.env, cwd: srcPath});


/// `make` does not throw an error when encountering errors, so we need to do that manually.
if (Number(child.status) !== 0) {
    process.exit(Number(child.status));
}

if (buildWithEmscripten) {
    if (params["asm-js"]) {
        fixUpASMJSBuild();
    } else {
        fixUpWASMBuild();
    }
} else {
    if (basename) {
        fs.renameSync(stockfishPath, p.join(srcPath, basename + getHashPart(stockfishPath)));
        builtFiles.push(p.join(srcPath, basename + getHashPart(stockfishPath)));
    } else {
        builtFiles.push(enginePath);
    }
}

if (params["output-dir"]) {
    moveBuiltFiles();
}

beep();
