#!/usr/bin/env node

var loadEngine = require("./load_engine.js");
var engine = loadEngine(require("path").join(__dirname, "stockfish.js"));

engine.send("setoption name Use NNUE value true");

engine.send("go infinite", function onDone(data)
{
    console.log("DONE:", data);
    engine.quit();
}, function onStream(data)
{
    console.log("STREAMING:", data);
});

setTimeout(function ()
{
    engine.send("stop");
}, 1000);
