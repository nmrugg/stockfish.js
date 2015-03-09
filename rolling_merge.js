// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

/// Usage:
///   node rolling-merge.js DATA_FILE.JSON
///     OR
///   node rolling-merge.js BRANCH_TO_MERGE [FORK_SHA]

"use strict";

var execFile = require("child_process").execFile;
var fs = require("fs");
var merge_candidates;
var build_path = require("path").join(__dirname, "build.sh");
var data_file = process.argv[2];
var branch;
var merge_data;
var total_commits;

try {
    merge_data = JSON.parse(fs.readFileSync(data_file, "utf8"));
    branch = merge_data.branch;
    merge_data.merged = merge_data.merged || [];
} catch (e) {
    branch = data_file;
    data_file = undefined;
}

if (!branch) {
    error("Error: No branch.");
    error("Usage: node rolling-merge.js DATA_FILE.JSON");
    console.log("  OR");
    error("Usage: node rolling-merge.js BRANCH_TO_MERGE [FORK_SHA]");
    return;
}

function store_commit(sha)
{
    if (data_file && merge_data && merge_data.merged.indexOf(sha) === -1) {
        merge_data.merged.push(sha);
        fs.writeFileSync(data_file, JSON.stringify(merge_data, null, "    "));
    }
}

function beep()
{
    process.stdout.write("\u0007");
}

function good(mixed)
{
    console.log("\u001B[32m" + mixed + "\u001B[0m");
}

function warn(mixed)
{
    console.warn("\u001B[33m" + mixed + "\u001B[0m");
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
                warn("Warning: Cannot parse \"" + line + "\" for sha.");
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
    git_cmd(["cherry", "HEAD", branch], function oncheck(data)
    {
        var commits = []
        data.trim().split("\n").forEach(function oneach(line, i)
        {
            ///NOTE: If it's minus, we already have it.
            if (line[0] === "+") {
                /// Chop off the + and space.
                commits[i] = line.substr(2);
            }
        });
        
        cb(commits);
    });
}

function is_candidate(candidates, sha)
{
    var is_commited;
    
    if (merge_data && merge_data.merged && merge_data.merged.length) {
        is_commited = merge_data.merged.some(function oneach(this_sha)
        {
            if (this_sha.substr(0, sha.length) === sha) {
                return true; /// Break and return.
            }
        });
    }
    
    if (is_commited) {
        return false;
    }
    
    return candidates.some(function oneach(this_sha)
    {
        if (this_sha.substr(0, sha.length) === sha) {
            return true; /// Break and return.
        }
    });
}

function cherry_pick(sha, cb)
{
    ///NOTE: Ideally, merge_candidates should'nt be a global.
    if (is_candidate(merge_candidates, sha)) {
        console.log("Cherrypicking " + sha);
        ///NOTE: -x adds the sha to the commit message to make it easier to see where it came from.
        git_cmd(["cherry-pick", "-Xignore-all-space", "-x", sha], true, cb);
    } else {
        /// Skip
        cb("skipped");
    }
}

function test_it(sha, next)
{
    console.log("Building " + sha + ". Please wait...");
    //execFile("make", ["build", "ARCH=js"], {cwd: build_dir, env: process.env}, function onexec(err, stdout, stderr)
    execFile(build_path, {env: process.env}, function onexec(err, stdout, stderr)
    {
        if (err || stdout.indexOf("warning: unresolved symbol") > -1 || stderr.indexOf("warning: unresolved symbol") > -1) {
            error("Error: Cannot properly build " + sha);
                if (stdout) {
                    console.log("STDOUT:");
                    error(stdout);
                }
                if (stderr) {
                    console.log("STDERR:");
                    error(stderr);
                }
            error("Error: Cannot properly build " + sha);
            console.log("");
            warn("*NOTE* To undo commit the last commit: git reset --hard HEAD~1");
            console.log("");
            throw new Error(err);
        }
        
        good("Built " + sha + " successfully!");
        console.log("Testing " + sha + ". Please wait...");
        execFile(process.execPath, ["tester.js"], {env: process.env}, function onexec(err, stdout, stderr)
        {
            if (err) {
                error("Error: Failed testing: " + sha);
                if (stdout) {
                    console.log("STDOUT:");
                    error(stdout);
                }
                if (stderr) {
                    console.log("STDERR:");
                    error(stderr);
                }
                error("Error: Failed testing: " + sha);
                console.log("");
                warn("*NOTE* To undo commit the last commit: git reset --hard HEAD~1");
                console.log("");
                throw new Error(err);
            }
            
            good("Tested " + sha + " successfully!");
            store_commit(sha);
            setImmediate(next);
        });
    });
}

function attempt_to_merge(sha, next, i)
{
    if (total_commits) {
        console.log((i + 1) + " / " + total_commits + " (" + (((i + 1) / total_commits) * 100).toFixed(2) + "%)");
    }
    cherry_pick(sha, function onpick(err, stdout, stderr)
    {
        if (err) {
            /// Nothing changed, keep going.
            if (err === "skipped" || stdout.indexOf("no changes added to commit") > -1 || stdout.indexOf("nothing to commit (working directory clean)") > -1 || stdout.indexOf("nothing to commit") > -1) {
                store_commit(sha);
                good("Skipping " + sha + ".");
                return setImmediate(next);
            } else if (stderr.indexOf("Automatic cherry-pick failed.") > -1 || stderr.indexOf("error: could not apply") > -1) {
                warn("Merge conflict. Please fix manually.");
                warn("*NOTE* To abort the merge: git reset --hard HEAD");
                console.log("After merging, check build: ./build.sh && node tester.js");
                if (data_file) {
                    console.log("Note, you may need to add " + sha + " manually.");
                }
                return;
            } else {
                error("Error: Cannot cherypick " + sha);
                if (stdout) {
                    console.log("STDOUT:");
                    error(stdout);
                }
                if (stderr) {
                    console.log("STDERR:");
                    error(stderr);
                }
                throw new Error(err);
            }
        }
        test_it(sha, next);
    });
}

function init(cb)
{
    check_for_changes(function oncheck(changes)
    {
        if (changes) {
            return error("Found changes. Commit your changes first.");
        }
        get_sha1_from_branch("HEAD", function onget(head_sha)
        {
            get_sha1_from_branch(branch, function onget(to_sha)
            {
                get_fork_point(head_sha, to_sha, function onget(starting_sha)
                {
                    /// Be able to override starting commit.
                    if (merge_data && merge_data.starting_sha) {
                        starting_sha = merge_data.starting_sha;
                    } else {
                        starting_sha = process.argv[3] || starting_sha;
                    }
                    
                    if (!starting_sha) {
                        throw new Error("Caanot find starting fork point. Override by supplying fork sha.");
                    }
                    
                    /// Find out which commits have not been cherry picked yet.
                    get_merge_candidates(branch, function onget(candidates)
                    {
                        merge_candidates = candidates;
                        get_commit_history(starting_sha, to_sha, function onget(commits)
                        {
                            total_commits = commits.length;
                            async_loop(commits, cb, attempt_to_merge);
                        });
                    });
                });
            });
        });
    });
}

init(beep);
