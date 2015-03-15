// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

/// Usage:
///   node rolling-merge.js BRANCH_TO_MERGE SHA

"use strict";

var execFile = require("child_process").execFile;
var branch = process.argv[2];
var sha = process.argv[3];
var tmp_branch = "tmp_branch_";

if (!branch) {
    error("Error: No branch.");
    error("Usage: node rolling-merge.js BRANCH_TO_MERGE SHA");
    return;
}
tmp_branch += branch;
if (!sha) {
    error("Error: No SHA.");
    error("Usage: node rolling-merge.js BRANCH_TO_MERGE SHA");
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
            error(stdout);
            error(stderr);
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



function run()
{
    check_for_changes(function oncheck(changes)
    {
        if (changes) {
            return error("Found changes. Commit your changes first.");
        }
        console.log(tmp_branch)
        process.exit();
        git_cmd(["branch", "-D", tmp_branch], true, function ondel()
        {
            git_cmd(["branch", "checkout", branch], function oncheckout()
            {
                git_cmd(["branch", "checkout", "-b", tmp_branch], function oncreatecheckout()
                {
                    //git_cmd(["reset", "--hard", sha], beep);
                });
            });
        });
    });
}

run();
