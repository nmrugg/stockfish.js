#!/usr/bin/env node

"use strict";

var spawnSync = require("child_process").spawnSync;
var params = get_params();
var args = ["-C", "src", "build", "ARCH=js", "-j", require("os").cpus().length];
var fs = require("fs");
var p = require("path");
var stockfish_path = p.join(__dirname, "src", "stockfish.js");
var data;
var license = fs.readFileSync(p.join(__dirname, "src", "license.js"), "utf8");

function get_params(argv)
{
    var i,
        params = {};
    
    argv = argv || process.argv;
    
    for (i = process.argv.length - 1; i >= 2; i -= 1) {
        if (process.argv[i][0] === "-") {
            params[process.argv[i].replace(/^-+/, "")] = 1;
        } else {
            if (!params.tests) {
                params.tests = [];
            }
            params.tests.push(process.argv[i]);
        }
    }
    
    return params;
}

if (params.help) {
    console.log("");
    console.log("Build Stockfish with Emscripten");
    console.log("Usage: ./build.js [--force || --force-js]");
    console.log("");
    console.log("  --force     Always rebuild the entire project");
    console.log("  --force-js  Always recompile the JS code");
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

spawnSync("make", args, {stdio: [0,1,2], env: process.env, cwd: __dirname});

data = fs.readFileSync(stockfish_path, "utf8");

/// Add the license if it's not there (emscripten removes all comments).
if (data.indexOf(license) !== 0) {
    fs.writeFileSync(stockfish_path, license + data);
}
