#!/usr/bin/env node

var params = get_params({booleans: ["help", "h", "min", "no-min", "light-min"]});
var p = require("path");
var fs = require("fs");
var execSync = require("child_process").execSync;
var ceacDir = params["ceac-repo"] || p.join(__dirname, "..", "ceac");

function color(color_code, str)
{
    if (process.stdout.isTTY) {
        str = "\u001B[" + color_code + "m" + str + "\u001B[0m";
    }
    
    return str;
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

function good(str)
{
    return color(32, str);
}

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
function copy()
{
    var baseDir = p.join(ceacDir, "chess_engines", "stockfish");
    var srcDir;
    var syzygyDir;
    
    try {
        execSync("rm -rf " + baseDir, {cwd: __dirname, env: process.env});
    } catch (e) {}
    
    try {
        fs.mkdirSync(baseDir);
    } catch (e) {}
    
    execSync("cp build.js readme.md .gitignore " + baseDir, {cwd: __dirname, env: process.env});
    
    srcDir = p.join(baseDir, "src");
    
    fs.mkdirSync(srcDir);
    
    execSync("cp *.cpp *.h Makefile license.js pre.js post.js " + srcDir, {cwd: p.join(__dirname, "src"), env: process.env});
    
    syzygyDir = p.join(srcDir, "syzygy");
    
    fs.mkdirSync(syzygyDir);
    
    execSync("cp *.cpp *.h " + syzygyDir, {cwd: p.join(__dirname, "src", "syzygy"), env: process.env});
}

if (params.h || params.help) {
    console.log("");
    console.log(bold("Copy Stockfish source code to where it needs to go"));
    console.log("Usage: updateCEAC.js " + highlight("[OPTIONS]"));
    console.log("");
    console.log("Options:");
    console.log("");
    console.log("  " + highlight("--ceac-repo") + "  The location of the CEAC repo");
    console.log("  " + highlight("-s --silent") + "  No beep");
    console.log("  " + highlight("-h --help") + "    Show this help");
    console.log("");
    return;
}

copy();

if (!params.s || parmas.silent) {
    process.stdout.write("\u0007");
}
