#!/usr/bin/env node
"use strict";
var assert = require("assert");
var latestAnalysis = require("../examples/latestAnalysis.js");

function harness()
{
    var sent = [];
    var searches = [];
    return {
        sent: sent,
        searches: searches,
        api: latestAnalysis({send: function (cmd, cb, stream)
        {
            sent.push(cmd);
            if (/^go(?:\s|$)/.test(cmd)) { searches.push({cb: cb, stream: stream}); }
        }})
    };
}
function tick() { return new Promise(function (resolve) { setTimeout(resolve, 5); }); }

async function main()
{
    var h = harness();
    var info = [];
    var a = h.api.analyze("position startpos", "go infinite", function (line) { info.push(line); });
    h.searches[0].stream("info depth 1");
    var b = h.api.analyze("position startpos moves e2e4", "go depth 10");
    var c = h.api.analyze("position startpos moves d2d4", "go depth 11");
    assert.deepStrictEqual(await a, {status: "cancelled"});
    assert.deepStrictEqual(await b, {status: "cancelled"});
    assert.deepStrictEqual(h.sent, ["position startpos", "go infinite", "stop"]);
    h.searches[0].stream("info depth 2");
    assert.deepStrictEqual(info, ["info depth 1"], "cancelled info must not reach the UI");
    h.searches[0].cb("bestmove e2e4");
    await tick();
    assert.deepStrictEqual(h.sent, ["position startpos", "go infinite", "stop",
        "position startpos moves d2d4", "go depth 11"]);
    h.searches[1].cb("bestmove d7d5");
    assert.deepStrictEqual(await c, {status: "completed", bestmove: "bestmove d7d5"});
    await tick();

    h = harness();
    a = h.api.analyze("position startpos", "go infinite");
    var requests = [];
    for (var i = 0; i < 25000; ++i) {
        requests.push(h.api.analyze("position startpos", "go nodes " + (i + 1)));
    }
    assert.strictEqual(h.sent.filter(function (cmd) { return cmd === "stop"; }).length, 1);
    h.api.stop();
    assert.strictEqual((await a).status, "cancelled");
    assert((await Promise.all(requests)).every(function (r) { return r.status === "cancelled"; }));
    h.searches[0].cb("bestmove e2e4");
    await tick();
    assert.strictEqual(h.searches.length, 1, "stop must discard pending work");
    var next = h.api.analyze("position startpos", "go depth 1");
    h.searches[1].cb("bestmove d2d4");
    assert.strictEqual((await next).status, "completed");
    await tick();

    await assert.rejects(h.api.analyze("position startpos", "go perft 1"), TypeError);
    await assert.rejects(h.api.analyze("position startpos\ngo infinite", "go depth 1"), TypeError);
    await assert.rejects(h.api.analyze("position startpos", "go depth 1\nquit"), TypeError);

    var expected = new Error("worker closed");
    var broken = latestAnalysis({send: function () { throw expected; }});
    await assert.rejects(broken.analyze("position startpos", "go depth 1"), function (e) { return e === expected; });
    await assert.rejects(broken.analyze("position startpos", "go depth 1"), function (e) { return e === expected; });
    console.log("Latest analysis helper tests passed");
}
main().catch(function (error) { console.error(error); process.exitCode = 1; });
