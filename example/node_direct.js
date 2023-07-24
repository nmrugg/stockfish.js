#!/usr/bin/env node

var Stockfish;
var engine;

if (process.argv[2] === "--help" || process.argv[2] === "-h") {
    console.log("Usage: node node_direct.js [FEN OR move1 move2 ...moveN]");
    console.log("");
    console.log("Examples:");
    console.log("   node simple_node.js");
    console.log("   node simple_node.js \"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2\"");
    console.log("   node simple_node.js g1f3 e7e5");
    process.exit();
}

/// For older Node.js versions, you may need --experimental-wasm-threads --experimental-wasm-simd.
try {
    var INIT_ENGINE = require("./stockfish.js");
    
    var wasmPath = require("path").join(__dirname, "stockfish.wasm");
    var engine = {
        locateFile: function (path)
        {
            if (path.indexOf(".wasm") > -1) {
                /// Set the path to the wasm binary.
                return wasmPath;
            } else {
                /// Set path to worker (self + the worker hash)
                return __filename;
            }
        },
    };
    if (typeof INIT_ENGINE === "function") {
        var Stockfish = INIT_ENGINE();
        try {
            Stockfish(engine).then(function ()
            {
                start();
            });
        } catch (e) {
            console.error(e);
            console.error("\nYour Node.js version appears to be too old. Also, try adding --experimental-wasm-threads --experimental-wasm-simd.\n");
            process.exit(1);
        }
    }
    
} catch (e) {
    console.error(e)
}

function start()
{
    var loadedNets;
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
        
        if (!loadedNets && line.indexOf("Load eval file success: 1") > -1) {
            loadedNets = true;
            send("uci");
        } else if (!gotUCI && line === "uciok") {
            gotUCI = true;
            send("position " + position);
            send("eval");
            send("d");
            
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
    
    send("setoption name Use NNUE value true");
}
