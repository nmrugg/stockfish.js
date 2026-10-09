#!/usr/bin/env node

/// This is an example of how to directly require() the stockfish.js repo.
///NOTE: Install with `npm i stockfish`.

/// Make sure the engine is present.
require("./get-engine.js");

var engineType = process.argv[2];

///NOTE: engineType can be a path to any stockfish.js engine or a keyword indicating which Stockfish.js engine to load.
///      Keywords include: "full", "lite", "single", "lite-single", and "asm".
///      enginePath is optional. If not passed, the full engine will be used.
///      
///      The second parameter is the function to call when the engine prints messages. If none is supplied, it will print to the console.
var stockfish = require("stockfish")(engineType || "lite-single", onMessage);

function onMessage(line)
{
    console.log("STDOUT:", line);
    if (/bestmove \S+/.test(line)) {
        console.log("The best move is " + line.match(/bestmove (\S+)/)[1] + ".");
        stockfish.terminate();
    }
}

stockfish.processCommand("uci");
stockfish.processCommand("go depth 5");
