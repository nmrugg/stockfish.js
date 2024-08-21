#!/usr/bin/env node

var loadEngine = require("./loadEngine.js");
var engine = loadEngine(require("path").join(__dirname, "..", "src", "stockfish.js"));

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
