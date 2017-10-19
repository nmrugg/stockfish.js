#!/usr/bin/env node

//! Chess.com (c) 2017

"use strict";

var spawnSync = require("child_process").spawnSync;
var execFileSync = require("child_process").execFileSync;
var params = get_params({booleans: ["no-chesscom", "debug-js", "h", "help", "help-all", "f", "force", "force-linking", "sync"]});
var args = ["build", "-j", require("os").cpus().length];
var fs = require("fs");
var p = require("path");
var stockfish_path;
var data;
var license = fs.readFileSync(p.join(__dirname, "src", "license.js"), "utf8");
var buildToJs;
var child;
var stockfishVersion = "8";
var postFilePath;
var postFile;

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
    if (process.stdout.isTTY) {
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


if (!params.make) {
    params.make = "make";
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

if (params.help || params["help-all"] || params.h) {
    console.log("");
    console.log(bold("Build the Stockfish Chess Engine"));
    console.log("Usage: ./build.js [" + highlight("options") + "]");
    console.log("");
    console.log("  " + highlight("-f --force") + "      Always rebuild the entire project");
    console.log("  " + highlight("--force-linking") + " Always preforming the final linking step");
    console.log("  " + highlight("--variants") + "      Comma separated list of variants to include (default \"" + note("all") + "\")");
    console.log(                     "                  \"" + note("none") + "\" (no variants, except for Chess960),");
    console.log(                     "                  \"" + note("anti") + "\", \"" + note("atomic") + "\", \"" + note("crazyhouse") + "\", \"" + note("horde") + "\",");
    console.log(                     "                  \"" + note("kingofthehill") + "\", \"" + note("race") + "\", \"" + note("relay") + "\", \"" + note("3check") + "\"");
    console.log("  " + highlight("--no-chesscom") + "   Disable changes made specifically for chess.com;");
    console.log(                     "                  this includes showing SAN moves, fixing three-fold repetition,");
    console.log(                     "                  addition of \"mindepth\", \"maxdepth\", and \"shallow\" options to the \"go\" command,");
    console.log(                     "                  and \"Skill Level Maximum Error\" and \"Skill Level Probability\" uci options");
    console.log("  " + highlight("--sync") + "          Compile Stockfish to run searches synchronously (JS only)");
    console.log("  " + highlight("--debug-js") + "      Compile JS in debug mode (adds ASSERTIONS=2 and SAFE_HEAP=1)");
    console.log("  " + highlight("--arch") + "          Architecture to build to (default \"" + note("js") + "\")");
    console.log(                     "                  \"" + note("x86-64-bmi2") + "\" is likely the fastest");
    console.log(                     "                  See --help-all for more options");
    console.log("  " + highlight("--make") + "          Path to program used to make Stockfish (default \"" + note("make") + "\")");
    console.log("  " + highlight("--comp") + "          Compiler to build C code with");
    console.log("  " + highlight("--compcxx") + "       Compiler to build C++ code with");
    console.log("  " + highlight("--version") + "       Specify Stockfish version number (default: " + note(stockfishVersion) + ")");
    console.log(                     "                  Use \"" + note("date") + "\" to use the current date");
    console.log(                     "                  Use \"" + note("timestamp") + "\" to use the current Unix timestamp");
    console.log(                     "                  Use \"" + note("hash") + "\" to use the current git commit hash");
    console.log("  " + highlight("-h --help") + "       Show build.js's help");
    console.log("  " + highlight("--help-all") + "      Show Stockfish's Makefile help as well");
    console.log("");
    console.log("Examples:");
    console.log("");
    console.log("  Default: include all modifications and variants, compile to JS");
    console.log("    ./build.js");
    console.log("");
    console.log("  Vanilla Stockfish: no modifications, no variants, 64-bit native binary");
    console.log("    ./build.js --no-chesscom --variants=none --arch=x86-64-bmi2");
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

if (!params["no-chesscom"]) {
    args.push("CHESSCOM=1");
}

if (params["debug-js"]) {
    if (buildToJs) {
        args.push("DEBUGJS=1");
    } else {
        warn("Ignoring --debug-js");
    }
}

if (params.sync) {
    if (buildToJs) {
        args.push("SYNC=1");
        /// Remove code that breaks sync mode
        postFilePath = p.join(__dirname, "src", "post.js");
        postFile = fs.readFileSync(postFilePath, "utf8");
        fs.writeFileSync(postFilePath, postFile.replace(/\/\*\* Async Only START \*\*\/[\s\S]*?\/\*\* Async Only END \*\*\//, ""));
    } else {
        warn("Ignoring --sync");
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

child = spawnSync(params.make, args, {stdio: [0,1,2], env: process.env, cwd: p.join(__dirname, "src")});

/// Reset version string.
if (String(params.version).toLowerCase() !== "date") {
    changeVersion("");
}

/// `make` does not throw an error when encountering errors, so we need to do that manually.
if (Number(child.status) !== 0) {
    process.exit(Number(child.status));
}

if (buildToJs) {
    data = fs.readFileSync(stockfish_path, "utf8");
    
    /// Add the license if it's not there (emscripten removes all comments).
    if (data.indexOf(license) !== 0) {
        fs.writeFileSync(stockfish_path, license + data);
    }
    if (params.sync) {
        fs.writeFileSync(postFilePath, postFile);
    }
}
