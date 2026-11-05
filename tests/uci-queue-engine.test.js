#!/usr/bin/env node
"use strict";

// Export the scenarios so browser tests can run the same assertions on Workers.
async function runScenarios(createClient, log)
{
    function check(value, message)
    {
        if (!value) { throw new Error(message); }
    }
    async function test(name, body)
    {
        var client = await createClient();
        try {
            await body(client);
            log("PASS " + name);
        } finally {
            await client.close();
        }
    }
    var mate = "position fen 7k/8/5KQ1/8/8/8/8/8 w - - 0 1";

    await test("every queued go returns its own move", async function (c)
    {
        ["e2e4", "d2d4", "g1f3"].forEach(function (move)
        {
            c.send("position startpos");
            c.send("go depth 1 searchmoves " + move);
        });
        for (var move of ["e2e4", "d2d4", "g1f3"]) {
            var line = await c.waitFor(/^bestmove /);
            check(line.split(" ")[1] === move, "wrong response order: " + line);
        }
    });

    await test("queued isready does not wait for go infinite", async function (c)
    {
        c.send("position startpos");
        c.send("go infinite");
        await c.waitFor(/^info depth [1-9]/);
        c.send("stop");
        c.send("position startpos moves e2e4");
        c.send("go infinite");
        c.send("isready");
        await c.waitFor(/^readyok$/);
        check(c.lines.filter(function (line) { return /^bestmove /.test(line); }).length === 1,
            "isready must not finish the replacement search");
        c.send("stop");
        await c.waitFor(/^bestmove /);
    });

    await test("search recovers after perft", async function (c)
    {
        c.send("position startpos");
        c.send("go perft 1");
        await c.waitFor(/^Nodes searched: 20$/);
        c.send(mate);
        c.send("go depth 1");
        check(/^bestmove g6g7(?: |$)/.test(await c.waitFor(/^bestmove /)), "perft blocked the next search");
    });

    await test("tabs do not bypass serialization", async function (c)
    {
        c.send("position startpos");
        c.send("go infinite");
        await c.waitFor(/^info depth [1-9]/);
        c.send(mate.replace("position ", "position\t"));
        c.send("go\tdepth 1");
        c.send("stop");
        await c.waitFor(/^bestmove /);
        check(/^bestmove g6g7(?: |$)/.test(await c.waitFor(/^bestmove /)), "tab-separated search was lost or overlapped");
    });

    await test("no-legal-moves search releases the queue", async function (c)
    {
        c.send("position fen 7k/6Q1/5K2/8/8/8/8/8 b - - 0 1");
        c.send("go depth 1");
        c.send(mate);
        c.send("go depth 1");
        check(/^bestmove (\(none\)|0000)/.test(await c.waitFor(/^bestmove /)), "expected no legal move");
        check(/^bestmove g6g7(?: |$)/.test(await c.waitFor(/^bestmove /)), "terminal search blocked the next one");
    });
}

async function nodeClient(enginePath)
{
    var child = require("child_process").spawn(process.execPath, [enginePath], {stdio: ["pipe", "pipe", "pipe"]});
    var lines = [];
    var cursor = 0;
    var waiter;
    var failure;
    var closed = false;
    var stderr = "";
    function advance()
    {
        if (!waiter) { return; }
        if (failure) {
            var reject = waiter.reject;
            clearTimeout(waiter.timer);
            waiter = null;
            reject(failure);
            return;
        }
        while (cursor < lines.length) {
            var line = lines[cursor++];
            if (waiter.pattern.test(line)) {
                var resolve = waiter.resolve;
                clearTimeout(waiter.timer);
                waiter = null;
                resolve(line);
                return;
            }
        }
    }
    require("readline").createInterface({input: child.stdout}).on("line", function (line)
    {
        lines.push(line);
        advance();
    });
    child.stderr.on("data", function (data) { stderr += data; });
    child.stdin.on("error", function (error) { failure = error; advance(); });
    child.on("error", function (error) { failure = error; advance(); });
    child.on("exit", function (code, signal)
    {
        if (!closed) {
            failure = new Error("engine exited: " + (signal || code) + "\n" + stderr);
            advance();
        }
    });
    var client = {
        lines: lines,
        send: function (command) { child.stdin.write(command + "\n"); },
        waitFor: function (pattern)
        {
            return new Promise(function (resolve, reject)
            {
                waiter = {pattern: pattern, resolve: resolve, reject: reject, timer: setTimeout(function ()
                {
                    waiter = null;
                    reject(new Error("timed out waiting for " + pattern + "\n" + lines.slice(-10).join("\n") + "\n" + stderr));
                }, 10000)};
                advance();
            });
        },
        close: function ()
        {
            closed = true;
            if (waiter) { clearTimeout(waiter.timer); }
            return new Promise(function (resolve)
            {
                if (child.exitCode !== null || child.signalCode !== null) { resolve(); return; }
                child.once("close", resolve);
                child.kill("SIGKILL");
            });
        }
    };
    try {
        client.send("uci");
        await client.waitFor(/^uciok$/);
        if (!/single|asm/.test(require("path").basename(enginePath))) {
            client.send("setoption name Threads value 2");
        }
        client.send("isready");
        await client.waitFor(/^readyok$/);
        return client;
    } catch (error) {
        await client.close();
        throw error;
    }
}

function testLoadEngine(enginePath)
{
    return new Promise(function (resolve, reject)
    {
        var engine;
        var seen = [];
        var timer = setTimeout(function () { finish(new Error("loadEngine callbacks timed out: " + JSON.stringify(seen))); }, 10000);
        function finish(error)
        {
            clearTimeout(timer);
            engine.quit();
            if (error) { reject(error); } else { resolve(); }
        }
        engine = require("../examples/loadEngine.js")(enginePath, {}, function ()
        {
            ["e2e4", "d2d4", "g1f3"].forEach(function (move)
            {
                engine.send("position startpos");
                engine.send("go depth 1 searchmoves " + move, function (line)
                {
                    seen.push(line);
                    if (line.split(" ")[1] !== move) { finish(new Error("wrong callback: " + move + " received " + line)); return; }
                    if (seen.length === 3) { finish(); }
                });
            });
        });
    });
}

module.exports = {runScenarios: runScenarios, nodeClient: nodeClient, testLoadEngine: testLoadEngine};
if (require.main === module) {
    (async function ()
    {
        var enginePath = require("path").resolve(process.argv[2] || "bin/stockfish-19-lite-single.js");
        await runScenarios(function () { return nodeClient(enginePath); }, console.log);
        await testLoadEngine(enginePath);
        console.log("PASS loadEngine callback correlation: " + enginePath);
    }()).catch(function (error) { console.error(error); process.exitCode = 1; });
}
