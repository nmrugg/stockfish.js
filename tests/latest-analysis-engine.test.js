#!/usr/bin/env node
"use strict";

async function runScenario(engine, createHelper)
{
    function check(value, message) { if (!value) { throw new Error(message); } }
    var goCount = 0;
    var send = engine.send;
    engine.send = function (cmd, cb, stream)
    {
        if (/^go(?:\s|$)/.test(cmd)) { goCount += 1; }
        return send(cmd, cb, stream);
    };
    var helper = createHelper(engine);
    var started;
    var infoSeen = new Promise(function (resolve) { started = resolve; });
    var oldInfoCount = 0;
    var first = helper.analyze("position startpos", "go infinite", function (line)
    {
        oldInfoCount += 1;
        if (/^info depth [1-9]/.test(line)) { started(); }
    });
    await infoSeen;
    var beforeCancel = oldInfoCount;
    var requests = [];
    for (var i = 0; i < 100; ++i) {
        requests.push(helper.analyze("position startpos moves " + (i % 2 ? "d2d4" : "e2e4"), "go depth 20"));
    }
    var final = helper.analyze("position fen 7k/8/5KQ1/8/8/8/8/8 w - - 0 1", "go depth 4");
    check(goCount === 1, "a new search started before the old bestmove");
    check((await first).status === "cancelled", "active request was not cancelled");
    check((await Promise.all(requests)).every(function (r) { return r.status === "cancelled"; }),
        "a superseded request received a result");
    var result = await final;
    check(result.status === "completed" && /^bestmove g6g7(?: |$)/.test(result.bestmove), "wrong final result");
    check(goCount === 2, "superseded searches were sent to the engine");
    check(oldInfoCount === beforeCancel, "stale info was delivered after cancellation");
    check(engine.get_queue_len() === 0, "loadEngine retained an unanswered request");

    var another = helper.analyze("position startpos", "go infinite");
    helper.stop();
    check((await another).status === "cancelled", "explicit stop did not settle the request");
    return {searches: goCount, cancelled: requests.length + 1, bestmove: result.bestmove};
}

module.exports = runScenario;
if (require.main === module) {
    var enginePath = require("path").resolve(process.argv[2] || "bin/stockfish-19-lite-single.js");
    var engine;
    var timer = setTimeout(function ()
    {
        engine.quit();
        console.error("Latest analysis engine test timed out");
        process.exitCode = 1;
    }, 15000);
    engine = require("../examples/loadEngine.js")(enginePath, {}, function ()
    {
        runScenario(engine, require("../examples/latestAnalysis.js")).then(function (result)
        {
            console.log("PASS latest analysis " + enginePath + " " + JSON.stringify(result));
        }).catch(function (error)
        {
            console.error(error);
            process.exitCode = 1;
        }).finally(function ()
        {
            clearTimeout(timer);
            engine.quit();
        });
    });
}
