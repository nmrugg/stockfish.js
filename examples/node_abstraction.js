#!/usr/bin/env node

/// This is an example of how to use the loadEngine.js abstraction layer.
/// This should work with any UCI compatible engine, even standard binary engines.

/// Make sure the engine is present.
require("./get-engine.js");

var loadEngine = require("./loadEngine.js");
var engine = loadEngine(require("stockfish").findEngine(process.argv[2] || "full"));

engine.send("uci", function onDone(data)
{
    var name = data.match(/id name (.*)/)?.[1];
    console.log("- Loaded", name);
});

engine.send("go infinite", function onDone(data)
{
    console.log("The best move is " + data.match(/bestmove (\S+)/)?.[1] + ".");
    engine.quit();
}, function onStream(data)
{
    console.log("STREAMING:", data);
});

setTimeout(function ()
{
    console.log("---STOP---");
    engine.send("stop");
}, 1000);

