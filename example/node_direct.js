#!/usr/bin/env node

var Stockfish;
var engine;

if (process.argv[2] === "--help") {
    console.log("Usage: node --experimental-wasm-bulk-memory --experimental-wasm-threads simple_node.js [FEN OR move1 move2 ...moveN]");
    console.log("");
    console.log("Examples:");
    console.log("   node simple_node.js");
    console.log("   node simple_node.js \"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2\"");
    console.log("   node simple_node.js g1f3 e7e5");
    process.exit();
}

/// Don't forget --experimental-wasm-bulk-memory --experimental-wasm-threads.
try {
    Stockfish = require("./stockfish.js")(console, require("path").join(__dirname, "stockfish.wasm"));
    
    Stockfish().then(function (sf)
    {
        engine = sf;
        
        start();
    });
} catch (e) {
    console.error(e)
}

function start()
{
    var gotUCI;
    var startedThinking;
    var position = "startpos";
    
    function send(str)
    {
        console.log("Sending: " + str)
        engine.postMessage(str);
    }
    
    engine.addMessageListener(function onLog(line)
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
            if (position) {
                send("position " + position);
                send("eval");
                send("d");
            }
            
            send("go ponder");
        } else if (!startedThinking && line.indexOf("info depth") > -1) {
            console.log("Thinking...");
            startedThinking = true;
            setTimeout(function ()
            {
                send("stop");
            }, 1000 * 3);
        } else if (line.indexOf("bestmove") > -1) {
            match = line.match(/bestmove\s+(\S+)/);
            if (match) {
                console.log("Best move: " + match[1]);
                engine.PThread.terminateAllThreads()
            }
        }
    });
    
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
