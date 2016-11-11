#!/usr/bin/env node

"use strict";

var spawnSync = require("child_process").spawnSync;
var params = get_params({booleans: ["disableChessCom", "debugjs"]});
var args = ["-C", "src", "build", "ARCH=js", "-j", require("os").cpus().length];
var fs = require("fs");
var p = require("path");
var stockfish_path = p.join(__dirname, "src", "stockfish.js");
var data;
var license = fs.readFileSync(p.join(__dirname, "src", "license.js"), "utf8");

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

if (params.help) {
    console.log("");
    console.log("Build Stockfish with Emscripten");
    console.log("Usage: ./build.js [options]");
    console.log("");
    console.log("  --force            Always rebuild the entire project");
    console.log("  --force-js         Always recompile the JS code");
    console.log("  --variants         Comma seperated list of variants to include (default \"all\")");
    console.log("                     \"none\" (no variants, except for Chess960),");
    console.log("                     \"anti\", \"atomic\", \"crazyhouse\", \"horde\",");
    console.log("                     \"kingofthehill\", \"race\", \"relay\", \"3check\"");
    console.log("  --disableChessCom  Disable changes made specifically for chess.com");
    console.log("  --debugjs          Compile in debug mode (adds ASSERTIONS=2 and SAFE_HEAP=1)");
    console.log("");
    process.exit();
} else if (params.force) {
    args.push("--always-make");
} else if (params["force-js"]) {
    ///NOTE: --force will also recompile the js, so there's no need to have both --force and --force-js.
    try {
        fs.unlinkSync(stockfish_path);
    } catch (e) {
        /// Don't throw if there is no file to delete.
        if (e.code !== "ENOENT") {
            throw e;
        }
    }
}

if (params.variants && params.variants.toLowerCase() !== "all") {
    args.push("VARIANTS=" + params.variants.toUpperCase());
}

if (!params.disableChessCom) {
    args.push("CHESSCOM=1");
}
if (params.debugjs) {
    args.push("DEBUGJS=1");
}

spawnSync("make", args, {stdio: [0,1,2], env: process.env, cwd: __dirname});

data = fs.readFileSync(stockfish_path, "utf8");

/// Add the license if it's not there (emscripten removes all comments).
if (data.indexOf(license) !== 0) {
    fs.writeFileSync(stockfish_path, license + data);
}
