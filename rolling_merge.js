// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

/// Usage: node rolling-merge.js BRANCH_TO_MERGE [FORK_SHA]

"use strict";

var execFile = require("child_process").execFile;
var merge_candidates;

var branch = process.argv[2];

if (!branch) {
    console.error("Error: No branch.");
    console.log("Usage: node rolling-merge.js BRANCH_TO_MERGE [FORK_SHA]");
    return;
}

function beep()
{
    process.stdout.write("\u0007");
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
            console.error("Git error: git " + args.join(" ") + "\n");
            console.error(stdout);
            console.error(stderr);
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

function staged_files_found(cb)
{
    git_cmd(["diff-index", "--quiet", "--cached", "HEAD"], true, function onexec(err)
    {
        if (err) {
            if (err.code === 1) {
                return cb(true);
            }
            throw err;
        }
        cb(false);
    });
}

function check_for_changes(cb)
{
    git_cmd(["ls-files", "-m"], function onexec(data)
    {
        cb(Boolean(data.trim()));
    });
}

function get_sha1_from_branch(branch, cb)
{
    git_cmd(["rev-parse", branch], function onexec(data)
    {
        cb(data.trim());
    });
}

function get_fork_point(sha1, sha2, cb)
{
    git_cmd(["merge-base", sha1, sha2], function onexec(data)
    {
        cb(data.trim());
    });
}

function get_commit_history(from_sha, to_sha, cb)
{
    git_cmd(["log", "--reverse", "--oneline", from_sha + ".." + to_sha], function onexec(data)
    {
        //cb(data.trim());
        var commits = []
        data.trim().split("\n").forEach(function oneach(line, i)
        {
            var sha = line.substr(0, line.indexOf(" "));
            if (sha) {
                commits[i] = sha;
            } else {
                console.log("Warning: Cannot parse \"" + line + "\" for sha.");
            }
        });
        
        cb(commits);
    });
}

function async_loop(arr, done, oneach)
{
    var len;
    
    if (!Array.isArray(arr)) {
        return done({error: "Not an array."});
    }
    
    len = arr.length;
    
    (function loop(i)
    {
        if (i >= len) {
            if (done) {
                return done();
            }
            return;
        }
        
        oneach(arr[i], function next()
        {
            loop(i + 1);
        }, i);
    }(0));
}

function get_merge_candidates(branch, cb)
{
    git_cmd(["cherry", branch], function oncheck(data)
    {
        var commits = []
        data.trim().split("\n").forEach(function oneach(line, i)
        {
            /// Chop off the +/- and space.
            commits[i] = line.substr(2);
        });
        
        cb(commits);
    });
}

function is_candidate(candidates, sha)
{
    return candidates.some(function oneach(this_sha)
    {
        if (this_sha.substr(0, sha.length) === sha) {
            return true;
        }
    });
}

function cherry_pick(sha, cb)
{
    ///NOTE: Ideally, merge_candidates should'nt be a global.
    if (is_candidate(merge_candidates, sha)) {
        git_cmd(["cherry-pick", sha], true, cb);
    } else {
        /// Skip
        console.log("Skipping " + sha);
        cb("skipped");
    }
}

function attempt_to_merge(sha, cb)
{
    console.log("Cherrypicking " + sha);
    ///NOTE: Undo commit: git reset --hard HEAD~1
    cherry_pick(sha, function onpick(err, stdout, stderr)
    {
        if (err) {
            /// Nothing changed, keep going.
            if (err === "skipped" || stdout.indexOf("no changes added to commit") > -1 || stdout.indexOf("nothing to commit (working directory clean)") > -1) {
                return setImmediate(cb);
            } else if (stderr.indexOf("Automatic cherry-pick failed.") > -1) {
                return console.log("Merge conflict. Please fix manually.");
            } else {
                console.error("Error: Cannot cherypick " + sha);
                console.error("STDOUT:");
                console.error(stdout);
                console.error("STDERR:");
                console.error(stderr);
                throw new Error(err);
            }
        }
        console.log("TODO: test the commit.");
    });
}

function init(cb)
{
    check_for_changes(function oncheck(changes)
    {
        if (changes) {
            return console.log("Found changes. Commit your changes first.");
        }
        get_sha1_from_branch("HEAD", function onget(head_sha)
        {
            get_sha1_from_branch(branch, function onget(to_sha)
            {
                //console.log(head_sha);
                //console.log(to_sha);
                get_fork_point(head_sha, to_sha, function onget(starting_sha)
                {
                    //console.log(starting_sha);
                    if (!starting_sha) {
                        if (process.argv[3]) {
                            starting_sha = process.argv[3];
                        } else {
                            throw new Error("Caanot find starting fork point. Override by supplying fork sha.");
                        }
                    }
                    
                    get_merge_candidates(branch, function onget(candidates)
                    {
                        merge_candidates = candidates;
                        get_commit_history(starting_sha, to_sha, function onget(commits)
                        {
                            async_loop(commits, cb, attempt_to_merge);
                        });
                    });
                });
            });
        });
    });
}

init(beep);
