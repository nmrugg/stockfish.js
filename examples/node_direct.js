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
    var fs = require("fs");
    var p = require("path");
    var pathToEngine = p.join(__dirname, "..", "src", fs.readlinkSync(p.join(__dirname, "../src/stockfish.js")));
    
    var ext = p.extname(pathToEngine);
    var basepath = pathToEngine.slice(0, -ext.length);
    var wasmPath = basepath + ".wasm";
    var basename = p.basename(basepath);
    var engineDir = p.dirname(pathToEngine);
    var buffers = [];
    
    var INIT_ENGINE = require(pathToEngine);
    
    var engine = {
        locateFile: function (path)
        {
            if (path.indexOf(".wasm") > -1) {
                if (path.indexOf(".wasm.map") > -1) {
                    /// Set the path to the wasm map.
                    return wasmPath + ".map"
                }
                /// Set the path to the wasm binary.
                return wasmPath;
            } else {
                return pathToEngine;
            }
        },
    };
    
    /// We have to manually assemble the WASM parts, if the engine is split into parts.
    fs.readdirSync(engineDir).sort().forEach(function (path)
    {
        ///NOTE: These could be out of order without zero padding.
        if (path.startsWith(basename + "-part-") && path.endsWith(".wasm")) {
            buffers.push(fs.readFileSync(p.join(engineDir, path)));
        }
    });
    
    if (buffers.length) {
        engine.wasmBinary = Buffer.concat(buffers);
    }
    
    if (typeof INIT_ENGINE === "function") {
        var Stockfish = INIT_ENGINE();
        try {
            
            Stockfish(engine).then(function checkIfReady()
            {
                if (engine._isReady) {
                    if (!engine._isReady()) {
                        return setTimeout(checkIfReady, 10);
                    }
                    delete engine._isReady;
                }
                
                engine.sendCommand = function (cmd)
                {
                    /// Not sure why this needs to be async.
                    setImmediate(function ()
                    {
                        engine.ccall("command", null, ["string"], [cmd], {async: /^go\b/.test(cmd)})
                    });
                };

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
    var gotUCI;
    var startedThinking;
    var position = "startpos";
    
    function send(str)
    {
        console.log("Sending: " + str)
        engine.sendCommand(str);
    }
    
    engine.listener = function onLog(line)
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
    };
    
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
