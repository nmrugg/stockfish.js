#!/usr/bin/env node

"use strict";

/// This is an example of how to directly require() a stockfish.js engine as a CommonJS module.
/// For older Node.js versions, you may need --experimental-wasm-threads --experimental-wasm-simd.

var Stockfish;
var engine;

/// Make sure the engine is present.
require("./get-engine.js");

if (process.argv[2] === "--help" || process.argv[2] === "-h") {
    console.log("Usage: node node_direct.js [FEN OR move1 move2 ...moveN]");
    console.log("");
    console.log("Examples:");
    console.log("   node node_direct.js");
    console.log("   node node_direct.js \"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2\"");
    console.log("   node node_direct.js g1f3 e7e5");
    process.exit();
}

function start()
{
    var engine = require("stockfish")(onLog);
    var gotUCI;
    var startedThinking;
    var position = "startpos";
    
    function send(str)
    {
        console.log("Sending: " + str)
        engine.processCommand(str);
    }
    
    function onLog(line)
    {
        var match;
        
        console.log("Line: " + line)
        
        if (typeof line !== "string") {
            console.log("Got line:");
            console.log(typeof line);
            console.log(line);
            return;
        }
        
        if (!gotUCI && line === "uciok") {
            gotUCI = true;
            send("position " + position);
            send("eval");
            send("d");
            
            send("setoption name MultiPV value 3");
            send("go ponder");
        } else if (!startedThinking && line.indexOf("info depth") > -1) {
            console.log("Stopping in three seconds...");
            startedThinking = true;
            setTimeout(function ()
            {
                send("stop");
            }, 1000 * 3);
        } else if (line.indexOf("bestmove") > -1) {
            match = line.match(/bestmove\s+(\S+)/);
            if (match) {
                console.log("Best move: " + match[1]);
                engine.terminate();
            }
        }
    }
    
    (function getPosition()
    {
        var i;
        var len;
        var tempArr;
        
        if (process.argv.length > 2) {
            /// Does it look like FEN?
            if (process.argv.length === 3 && process.argv[2].indexOf("/") > -1) {
                position = "fen " + process.argv[2];
            } else {
                tempArr = [];
                len = process.argv.length;
                for (i = 2; i <= len; i += 1) {
                    tempArr[tempArr.length] = process.argv[i];
                }
                position = "startpos moves " + tempArr.join(" ");
            }
        }
    }());
    
    send("uci");
}

start();
