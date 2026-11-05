#!/usr/bin/env node
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var context = {Promise: Promise, setTimeout: setTimeout};
var source = fs.readFileSync(path.join(__dirname, "../src/emscripten/extern-pre.js"), "utf8");
vm.runInNewContext(source + "\nthis.createUciQueue = createUciQueue; }());", context);

function harness(asyncGo)
{
    var sent = [];
    var finish;
    var queue = context.createUciQueue(function (cmd)
    {
        sent.push(cmd);
        if (asyncGo && /^go(?:\s|$)/.test(cmd)) {
            return new Promise(function (resolve) { finish = resolve; });
        }
    }, asyncGo);
    return {
        sent: sent,
        send: queue.processCommand,
        done: queue.onSearchDone,
        resolve: function () { finish(); }
    };
}

function testFifoAndReadiness()
{
    var h = harness(false);
    h.send("go infinite");
    h.send("isready");
    assert.deepStrictEqual(h.sent, ["go infinite", "isready"]);
    h.send("position startpos moves e2e4");
    h.send("go infinite");
    h.send("isready");
    h.send("stop");
    assert.deepStrictEqual(h.sent, ["go infinite", "isready", "stop"]);
    h.done();
    assert.deepStrictEqual(h.sent, [
        "go infinite", "isready", "stop",
        "position startpos moves e2e4", "go infinite", "isready"
    ], "readyok must not depend on finishing the replacement infinite search");
}

function testEveryGoSurvives()
{
    var h = harness(false);
    ["go depth 1", "position startpos moves e2e4", "go depth 2",
        "position startpos moves d2d4", "go depth 3"].forEach(h.send);
    assert.deepStrictEqual(h.sent, ["go depth 1"]);
    h.done();
    assert.deepStrictEqual(h.sent, ["go depth 1", "position startpos moves e2e4", "go depth 2"]);
    h.done();
    assert.deepStrictEqual(h.sent, ["go depth 1", "position startpos moves e2e4", "go depth 2",
        "position startpos moves d2d4", "go depth 3"]);
}

function testWhitespaceAndStop()
{
    var h = harness(false);
    ["  go\tdepth 1  ", "position\tstartpos", "go\tdepth 2", "stop", "ponderhit"].forEach(h.send);
    assert.deepStrictEqual(h.sent, ["go\tdepth 1", "stop", "ponderhit"]);
    h.done();
    assert.deepStrictEqual(h.sent, ["go\tdepth 1", "stop", "ponderhit", "position\tstartpos", "go\tdepth 2"],
        "stop must not silently remove a pending go");
}

function testStateAndQueries()
{
    var h = harness(false);
    ["go depth 1", "setoption name Hash value 32", "isready", "ucinewgame",
        "position startpos", "flip", "d", "eval", "go depth 2"].forEach(h.send);
    assert.deepStrictEqual(h.sent, ["go depth 1"]);
    h.done();
    assert.deepStrictEqual(h.sent, ["go depth 1", "setoption name Hash value 32", "isready",
        "ucinewgame", "position startpos", "flip", "d", "eval", "go depth 2"]);
}

function testQuit()
{
    var h = harness(false);
    ["go infinite", "position startpos", "go depth 1", "quit"].forEach(h.send);
    h.done();
    h.send("go depth 2");
    assert.deepStrictEqual(h.sent, ["go infinite", "quit"]);
}

async function testAsyncify()
{
    var h = harness(true);
    ["go infinite", "position startpos", "go depth 1", "isready", "stop"].forEach(h.send);
    h.done();
    assert.deepStrictEqual(h.sent, ["go infinite", "stop"], "C++ notification is too early for Asyncify");
    h.resolve();
    await Promise.resolve();
    assert.deepStrictEqual(h.sent, ["go infinite", "stop", "position startpos", "go depth 1", "isready"]);
    h.send("position startpos moves e2e4");
    h.done();
    assert.strictEqual(h.sent.length, 5, "a delayed notification must not finish the next search");
    h.resolve();
    await Promise.resolve();
    assert.strictEqual(h.sent.at(-1), "position startpos moves e2e4");
}

function testSynchronousCompletionAndReentry()
{
    var sent = [];
    var q = context.createUciQueue(function (cmd)
    {
        sent.push(cmd);
        if (cmd === "go depth 1") {
            q.processCommand("go depth 2");
            q.onSearchDone();
        }
    }, false);
    q.processCommand("go depth 1");
    assert.deepStrictEqual(sent, ["go depth 1", "go depth 2"]);
}

function testDispatchFailure()
{
    var expected = new Error("ccall failed");
    var count = 0;
    var q = context.createUciQueue(function () { count += 1; throw expected; }, false);
    assert.throws(function () { q.processCommand("go depth 1"); }, function (e) { return e === expected; });
    q.processCommand("position startpos");
    q.onSearchDone();
    assert.strictEqual(count, 1);
}

async function main()
{
    testFifoAndReadiness();
    testEveryGoSurvives();
    testWhitespaceAndStop();
    testStateAndQueries();
    testQuit();
    testSynchronousCompletionAndReentry();
    testDispatchFailure();
    await testAsyncify();
    console.log("UCI queue tests passed");
}
main().catch(function (error) { console.error(error); process.exitCode = 1; });
