#!/usr/bin/env node

"use strict";

var spawnSync = require("child_process").spawnSync;
var execFileSync = require("child_process").execFileSync;
var params = get_params({booleans: ["disable-chesscom", "debug-js", "help", "help-all", "force", "force-linking"]});
var args = ["build", "-j", require("os").cpus().length];
var fs = require("fs");
var p = require("path");
var stockfish_path;
var data;
var license = fs.readFileSync(p.join(__dirname, "src", "license.js"), "utf8");
var buildToJs;
var child;
var stockfishVersion = "8";

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


if (params.arch) {
    args.push("ARCH=" + params.arch);
    buildToJs = params.arch === "js";
} else {
    args.push("ARCH=js");
    buildToJs = true;
}

if (buildToJs) {
    stockfish_path = p.join(__dirname, "src", "stockfish.js");
} else {
    stockfish_path = p.join(__dirname, "src", "stockfish");
}

if (params.help || params["help-all"]) {
    console.log("");
    console.log("Build Stockfish with Emscripten");
    console.log("Usage: ./build.js [options]");
    console.log("");
    console.log("  --force             Always rebuild the entire project");
    console.log("  --force-linking     Always preforming the final linking step");
    console.log("  --variants          Comma seperated list of variants to include (default \"all\")");
    console.log("                      \"none\" (no variants, except for Chess960),");
    console.log("                      \"anti\", \"atomic\", \"crazyhouse\", \"horde\",");
    console.log("                      \"kingofthehill\", \"race\", \"relay\", \"3check\"");
    console.log("  --disable-chesscom  Disable changes made specifically for chess.com");
    console.log("  --debug-js          Compile in debug mode (adds ASSERTIONS=2 and SAFE_HEAP=1)");
    console.log("  --arch              Architecture to build to (default \"js\")");
    console.log("                      See --help-all for more options");
    console.log("  --version           Specify Stockfish version number (default: " + stockfishVersion + ")");
    console.log("                      Use \"date\" to use the current date");
    console.log("                      Use \"timestamp\" to use the current Unix timestamp");
    console.log("                      Use \"hash\" to use the current git commit hash");
    console.log("  --help              Show build.js's help");
    console.log("  --help-all          Show Stockfish's Makefile help as well");
    console.log("");
    if (params["help-all"]) {
        console.log("");
        console.log("******** Makefile Help ********");
        console.log("");
        spawnSync("make", {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});
    }
    process.exit();
} else if (params.force) {
    args.push("--always-make");
} else if (params["force-linking"]) {
    ///NOTE: --force will also link as well, so both are not needed.
    try {
        fs.unlinkSync(stockfish_path);
    } catch (e) {
        /// Don't throw if there is no file to delete.
        if (e.code !== "ENOENT") {
            throw e;
        }
    }
}

if (params.variants && params.variants !== true && params.variants.toLowerCase() !== "all") {
    args.push("VARIANTS=" + params.variants.toUpperCase());
}

if (!params["disable-chesscom"]) {
    args.push("CHESSCOM=1");
}
if (params["debug-js"]) {
    if (buildToJs) {
        args.push("DEBUGJS=1");
    } else {
        console.warn("WARN: Ignoring --debug-js");
    }
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

child = spawnSync("make", args, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});

/// Reset version string.
if (String(params.version).toLowerCase() !== "date") {
    changeVersion("");
}

/// `make` does not throw an error when encountering errors, so we need to do that manually.
if (!Number(child.status) !== 0) {
    process.exit(Number(child.status));
}

if (buildToJs) {
    data = fs.readFileSync(stockfish_path, "utf8");
    
    /// Add the license if it's not there (emscripten removes all comments).
    if (data.indexOf(license) !== 0) {
        fs.writeFileSync(stockfish_path, license + data);
    }
}
