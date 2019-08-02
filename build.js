#!/usr/bin/env node

//! Chess.com (c) 2018

"use strict";

var spawnSync = require("child_process").spawnSync;
var execFileSync = require("child_process").execFileSync;
var params = get_params({booleans: ["no-chesscom", "debug-js", "h", "help", "help-all", "f", "force", "force-linking", "b", "bin", "colors"]});
var args = ["build", "-j", require("os").cpus().length];
var fs = require("fs");
var p = require("path");
var stockfishPath = p.join(__dirname, "src", "stockfish");
var stockfishJSPath = p.join(__dirname, "src", "stockfish.asm.js");
var stockfishWASMPath = p.join(__dirname, "src", "stockfish.wasm");
var stockfishWASMLoaderPath = p.join(__dirname, "src", "stockfish.js");
var data;
var license = fs.readFileSync(p.join(__dirname, "src", "license.js"), "utf8");
var buildToWASM;
var buildToASMJS;
var buildToAnyJS;
var child;
var stockfishVersion = "10";
var postFilePath;
var postFile;
var fistRun;

function get_params(options, argv)
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


function color(color_code, str)
{
    if (process.stdout.isTTY || params.colors) {
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

function changeVersion(version)
{
    var filePath = p.join(__dirname, "src", "misc.cpp");
    var data = fs.readFileSync(filePath, "utf8");
    
    data = data.replace(/(const string Version = ")[^\"]*(";)/, "$1" + version + "$2");
    
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
        
        if (/\bbmi2\b/i.test(cpuData)) {
            arch = "x86-64-bmi2";
        } else if (/\bpopcnt\b/i.test(cpuData)) {
            arch = "x86-64-modern";
        } else {
            arch = "general-64";
        }
    }
    
    console.log(note("Building " + arch));
    args.push("ARCH=" + arch);
}


if (!params.make) {
    params.make = "make";
}

if (params.arch) {
    if (params.b || params.bin) {
        warn("Cannot user --bin (or -b) with --arch");
        process.exit(1);
    }
    
    if (params.arch === "js") {
        buildToWASM = true;
        buildToASMJS = true;
    } else {
        args.push("ARCH=" + params.arch);
        if (params.arch === "asmjs") {
            buildToASMJS = true;
        } else if (params.arch === "wasm") {
            buildToWASM = true;
        }
    }
} else if (params.b || params.bin) {
    determineBestArch()
} else {
    buildToWASM = true;
    buildToASMJS = true;
}

buildToAnyJS = buildToWASM || buildToASMJS;

if (params.help || params["help-all"] || params.h) {
    console.log("");
    console.log(bold("Build the Stockfish Chess Engine"));
    console.log("Usage: ./build.js [" + highlight("options") + "]");
    console.log("");
    console.log("  " + highlight("-f --force") + "      Always rebuild the entire project");
    console.log("  " + highlight("--force-linking") + " Always preforming the final linking step");
    console.log("  " + highlight("--variants") + "      Comma separated list of variants to include (default: " + note("none") + ")");
    console.log(                     "                  Possible values are " + note("all") + ", " + note("none") + " (no variants, except for Chess960),");
    console.log(                     "                  " + note("anti") + ", " + note("atomic") + ", " + note("crazyhouse") + ", " + note("horde") + ", " + note("kingofthehill") + ", " + note("race") + ", " + note("relay") + ", or " + note("3check"));
    console.log("  " + highlight("--no-chesscom") + "   Disable changes made specifically for chess.com;");
    console.log(                     "                  this includes showing SAN moves, fixing three-fold repetition,");
    console.log(                     "                  addition of mindepth, maxdepth, and shallow options to the go command,");
    console.log(                     "                  and Skill Level Maximum Error and Skill Level Probability uci options");
    console.log("  " + highlight("--static") + "        Link libaries statically (not JS)");
    console.log("  " + highlight("--debug-js") + "      Compile JS in debug mode (adds ASSERTIONS=2 and SAFE_HEAP=1)");
    console.log("  " + highlight("--arch") + "          Architecture to build to (default: " + note("js") + ")");
    console.log(                     "                  If the arch is set to " + note("js") + ", it will compile both an asm.js version");
    console.log(                     "                  and a WASM version. Set to " + note("asmjs") + " or " + note("wasm") + " for just one.");
    console.log(                     "                  " + note("x86-64-bmi2") + " is likely the fastest binary version");
    console.log(                     "                  See " + highlight("--help-all") + " for more options, or use " + highlight("--bin") + " instead");
    console.log("  " + highlight("--basename") + "      The filename for the engine (default: " + note ("stockfish") + ")");
    console.log(                     "                  This will not only rename the files, it will also rewrite the base JS file");
    console.log(                     "                  to load the correct WASM and ASM engines");
    console.log("  " + highlight("-b --bin") + "        Attempt to build a binary engine that is the most suitable for this system");
    console.log("  " + highlight("--make") + "          Path to program used to make Stockfish (default: " + note("make") + ")");
    console.log("  " + highlight("--comp") + "          Compiler to build C code with");
    console.log("  " + highlight("--compcxx") + "       Compiler to build C++ code with");
    console.log("  " + highlight("--version") + "       Specify Stockfish version number (default: " + note(stockfishVersion) + ")");
    console.log(                     "                  Use " + note("date") + " to use the current date");
    console.log(                     "                  Use " + note("timestamp") + " to use the current Unix timestamp");
    console.log(                     "                  Use " + note("hash") + " to use the current git commit hash");
    console.log("  " + highlight("--colors") + "        Always colorize the output, even through a pipe");
    console.log("  " + highlight("-h --help") + "       Show build.js's help");
    console.log("  " + highlight("--help-all") + "      Show Stockfish's Makefile help as well");
    console.log("");
    console.log("Examples:");
    console.log("");
    console.log("  Default: include all modifications and variants, compile to ASM.js and WASM");
    console.log("    ./build.js");
    console.log("");
    console.log("  Vanilla Stockfish: no modifications, no variants, 64-bit native binary");
    console.log("    ./build.js " + highlight("--no-chesscom") + " " + highlight("--variants=") + note("none") + " " + highlight("--arch=") + note("x86-64-bmi2"));
    console.log("");
    console.log("  Build Chess.com engine");
    console.log("    ./build.js " + highlight("-f") + " " + highlight("--variants") + " " +  note("crazyhouse,3check,koth"));
    console.log("");
    if (params["help-all"]) {
        console.log("");
        console.log(bold("******** Makefile Help ********"));
        console.log("");
        spawnSync(params.make, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
    }
    process.exit();
} else if (params.force || params.f) {
    args.push("--always-make");
} else if (params["force-linking"]) {
    ///NOTE: --force will also link as well, so both are not needed.
    try {
        if (buildToAnyJS) {
            if (buildToASMJS) {
                fs.unlinkSync(stockfishJSPath);
            } else {
                fs.unlinkSync(stockfishJSWASMPath);
                fs.unlinkSync(stockfishJSWASMLoaderPath);
            }
        } else {
            fs.unlinkSync(stockfishPath);
        }
    } catch (e) {
        /// Don't throw if there is no file to delete.
        if (e.code !== "ENOENT") {
            throw e;
        }
    }
}

if (params.variants && params.variants.toLowerCase() !== "all") {
    args.push("VARIANTS=" + params.variants.toUpperCase());
} else if (!params.variants) {
    args.push("VARIANTS=NONE");
}

if (!params["no-chesscom"]) {
    args.push("CHESSCOM=1");
}

if (params["debug-js"]) {
    if (buildToAnyJS) {
        args.push("DEBUGJS=1");
    } else {
        warn("Ignoring --debug-js");
    }
}

if (params.static) {
    if (buildToJs) {
        warn("Ignoring --static");
    } else {
        args.push("STATIC=1");
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

///NOTE: Stockfish will insert the date automatically if no version number is given.
if (String(params.version).toLowerCase() !== "date") {
    changeVersion(params.version === true || !params.version ? stockfishVersion : params.version);
}



if (buildToWASM && buildToASMJS) {
    console.log("\n" + note("Building ASM.js") + "\n");
    args.push("ARCH=asmjs");
    child = spawnSync(params.make, args, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
    args.pop();
    if (Number(child.status) !== 0) {
        process.exit(Number(child.status));
    }
    console.log("\n" + note("Building WASM") + "\n");
    args.push("ARCH=wasm");
    child = spawnSync(params.make, args, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
} else {
    child = spawnSync(params.make, args, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
}

/// Reset version string.
if (String(params.version).toLowerCase() !== "date") {
    changeVersion("");
}

/// `make` does not throw an error when encountering errors, so we need to do that manually.
if (Number(child.status) !== 0) {
    process.exit(Number(child.status));
}

if (!buildToAnyJS && params.basename) {
    fs.renameSync(stockfishPath, p.join(__dirname, "src", params.basename));
}

if (buildToASMJS) {
    data = fs.readFileSync(stockfishJSPath, "utf8");
    
    /// Add the license if it's not there (emscripten removes all comments).
    if (data.indexOf(license) !== 0) {
        fs.writeFileSync(stockfishJSPath, license + data);
    }
    
    if (params.basename) {
        fs.renameSync(stockfishJSPath, p.join(__dirname, "src", params.basename + ".asm.js"));
    }
}

if (buildToWASM) {
    data = fs.readFileSync(stockfishWASMLoaderPath, "utf8");
    
    /// Remove "var Module" so that it does not overwrite our custom module.
    data = data.replace("var Module;", "");
    
    if (params.basename) {
        data = data.replace(/stockfish\.wasm/g, params.basename + ".wasm");
    }
    
    /// Fix issues with locating the WASM file
    data = data.replace(/wasmBinaryFile=/g, "wasmBinaryFile=Module.wasmBinaryFile||");
    
    /// Add the license if it's not there (emscripten removes all comments).
    if (data.indexOf(license) !== 0) {
        fs.writeFileSync(stockfishWASMLoaderPath, license + data);
    }
    
    if (params.basename) {
        fs.renameSync(stockfishWASMLoaderPath, p.join(__dirname, "src", params.basename + ".js"));
        fs.renameSync(stockfishWASMPath, p.join(__dirname, "src", params.basename + ".wasm"));
    }
}
