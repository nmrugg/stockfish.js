// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

/// Usage:
///   node rolling-merge.js BRANCH_TO_MERGE SHA [FILE_1 ...FILE_N]

"use strict";

var execFile = require("child_process").execFile;
var branch = process.argv[2];
var sha = process.argv[3];
var tmp_branch = "TMP_branch_";
var files = [];
var tmp_files = [];
var current_branch;

if (!branch) {
    error("Error: No branch.");
    error("Usage: node rolling-merge.js BRANCH_TO_MERGE SHA [FILE_1 ...FILE_N]");
    return;
}
tmp_branch += branch;
if (!sha) {
    error("Error: No SHA.");
    error("Usage: node rolling-merge.js BRANCH_TO_MERGE SHA [FILE_1 ...FILE_N]");
    return;
}



function check_for_changes(cb)
{
    git_cmd(["ls-files", "-m"], function onexec(data)
    {
        cb(Boolean(data.trim()));
    });
}

function error(mixed)
{
    console.error("\u001B[31m" + mixed + "\u001B[0m");
}


function git_cmd(args, dont_throw, cb)
{
    if (typeof dont_throw === "function") {
        cb = dont_throw;
        dont_throw = false;
    }
    
    execFile("git", args, function onexec(err, stdout, stderr)
    {
        if (err && !dont_throw) {
            error("Git error: git " + args.join(" ") + "\n");
            if (stdout) {
                console.log("STDOUT***");
                error(stdout);
            }
            if (stderr) {
                console.log("STDERR***");
                error(stderr);
            }
            throw new Error(err);
        }
        if (cb) {
            if (dont_throw) {
                cb(err, stdout, stderr);
            } else {
                cb(stdout, stderr);
            }
        }
    });
}

function beep()
{
    process.stdout.write("\u0007");
}

function copy_files_and_return(cb)
{
    var fs = require("fs"),
        p = require("path"),
        tmpdir = require("os").tmpdir();
    
    if (!current_branch) {
        throw new Error("Can't get current branch.");
    }
    
    files.forEach(function oneach(file, i)
    {
        var tmp_file = p.join(tmpdir, Math.random() + p.basename(file));
        
        fs.writeFileSync(tmp_file, fs.readFileSync(file));
        
        tmp_files[i] = tmp_file;
    });
    
    /// Return
    git_cmd(["checkout", current_branch], function oncheckout()
    {
        tmp_files.forEach(function oneach(file, i)
        {
            /// Replace the files.
            fs.renameSync(file, files[i]);
        });
        
        if (cb) {
            cb();
        }
    });
}

function run()
{
    check_for_changes(function oncheck(changes)
    {
        if (changes) {
            return error("Found changes. Commit your changes first.");
        }
        git_cmd(["branch", "-D", tmp_branch], true, function ondel()
        {
            git_cmd(["checkout", branch], function oncheckout()
            {
                git_cmd(["checkout", "-b", tmp_branch], function oncreatecheckout()
                {
                    git_cmd(["reset", "--hard", sha], function onreset()
                    {
                        if (files.length) {
                            copy_files_and_return(beep);
                        } else {
                            beep();
                        }
                    });
                });
            });
        });
    });
}

(function get_files()
{
    var i,
        len = process.argv.length;
    
    for (i = 4; i < len; i += 1) {
        files[files.length] = process.argv[i];
    }
}());

(function get_current_branch()
{
    git_cmd(["rev-parse", "--abbrev-ref", "HEAD"], function onget(data)
    {
        current_branch = data.trim();
        
        run();
    });
}());
