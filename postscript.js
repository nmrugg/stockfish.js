return Stockfish;
/// End of STOCKFISH()
};


(function ()
{
    var isNode;
    var args;
    var myEngine;
    var queue = [];
    
    var myConsole = {
        log: log,
        error: log,
        warn: log,
    }
    
    function log(line)
    {
        /// Uncomment for debugging
        //console.log("-->", line);
    }
    
    function completer(line)
    {
        var completions = [
            "d",
            "eval",
            "exit",
            "flip",
            "go",
            "isready",
            "ponderhit",
            "position fen ",
            "position startpos",
            "position startpos moves",
            "quit",
            "setoption name Clear Hash value ",
            "setoption name Contempt value ",
            "setoption name Hash value ",
            "setoption name Minimum Thinking Time value ",
            "setoption name Move Overhead value ",
            "setoption name MultiPV value ",
            "setoption name Ponder value ",
            "setoption name Skill Level Maximum Error value ",
            "setoption name Skill Level Probability value ",
            "setoption name Skill Level value ",
            "setoption name Slow Mover value ",
            "setoption name Threads value ",
            "setoption name UCI_Chess960 value false",
            "setoption name UCI_Chess960 value true",
            "setoption name UCI_Variant value chess",
            "setoption name UCI_Variant value atomic",
            "setoption name UCI_Variant value crazyhouse",
            "setoption name UCI_Variant value giveaway",
            "setoption name UCI_Variant value horde",
            "setoption name UCI_Variant value kingofthehill",
            "setoption name UCI_Variant value racingkings",
            "setoption name UCI_Variant value relay",
            "setoption name UCI_Variant value threecheck",
            "setoption name Use NNUE value true",
            "setoption name Use NNUE value false",
            "setoption name nodestime value ",
            "stop",
            "uci",
            "ucinewgame"
        ];
        var completionsMid = [
            "binc ",
            "btime ",
            "confidence ",
            "depth ",
            "infinite ",
            "mate ",
            "maxdepth ",
            "maxtime ",
            "mindepth ",
            "mintime ",
            "moves ", /// for position fen ... moves
            "movestogo ",
            "movetime ",
            "ponder ",
            "searchmoves ",
            "shallow ",
            "winc ",
            "wtime "
        ];
        
        function filter(c)
        {
            return c.indexOf(line) === 0;
        }
        
        /// This looks for completions starting at the very beginning of the line.
        /// If the user has typed nothing, it will match everything.
        var hits = completions.filter(filter);
        
        if (!hits.length) {
            /// Just get the last word.
            line = line.replace(/^.*\s/, "");
            if (line) {
                /// Find completion mid line too.
                hits = completionsMid.filter(filter);
            } else {
                /// If no word has been typed, show all options.
                hits = completionsMid;
            }
        }
        
        return [hits, line];
    }   
    
    isNode = typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
    
    if (isNode) {
        global.XMLHttpRequest = function () {
            var xhr = {
                open: function (_, url) {
                    xhr._path = url;
                },
                send: function ()
                {
                    xhr.response = require("fs").readFileSync(require("path").join(__dirname, xhr._path));
                    xhr.status = 200;
                    setImmediate(xhr.onload);
                }
            };
            return xhr;
        };
        /// Is it a pThread or was it called directly?
        if (typeof module === "undefined" || require.main === module) {
            
            Stockfish = STOCKFISH(myConsole, require("path").join(require.main.path, "stockfish.wasm"));
            
            if (require("worker_threads").isMainThread) {
                myConsole.log = console.log;
                
                require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    completer: completer
                }).on("line", function online(line)
                {
                    if (line) {
                        if (line === "quit" || line === "exit") {
                            process.exit();
                        }
                        if (myEngine) {
                            myEngine.postMessage(line, true);
                        } else {
                            queue.push(line);
                        }
                    }
                }).on("SIGINT", process.exit).on("close", process.exit).setPrompt("");
                
                process.stdin.on("end", process.exit);
            }
            
            Stockfish().then(function (sf)
            {
                myEngine = sf;
                
                sf.addMessageListener(function onlog(line)
                {
                    console.log(line);
                });
                
                if (queue.length) {
                    queue.forEach(function (line)
                    {
                        sf.postMessage(line, true);
                    });
                }
                queue = null;
            });

            
        /// Is this a node module?
        } else {
            module.exports = STOCKFISH;
        }
        
    /// Is it a web worker?
    } else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined")) {
        if (self && self.location && self.location.hash) {
            args = self.location.hash.substr(1).split(",");
            Stockfish = STOCKFISH(myConsole, args[0], !Number(args[1]));
            
            /// If this is a pthread, then we need to stop here.
            if (args[1]) {
                return;
            }
        } else {
            Stockfish = STOCKFISH(myConsole, "", true);
        }
        
        /// Make sure that this is only added once.
        if (!onmessage) {
            onmessage = function (event)
            {
                if (myEngine) {
                    myEngine.postMessage(event.data, true);
                } else {
                    queue.push(event.data);
                }
            };
        }
        
        Stockfish().then(function (sf)
        {
            ///NOTE: To get the number of loaded threads loop through the sf.PThread.runningWorkers array and check for .loaded.
            
            myEngine = sf;
            
            sf.addMessageListener(function onlog(line)
            {
                postMessage(line);
            });
            
            if (queue.length) {
                queue.forEach(function (line)
                {
                    sf.postMessage(line, true);
                });
            }
            queue = null;
        });
    }
    ///NOTE: If it's a normal browser, we don't need to do anything. The client can use the INIT_ENGINE() function directly.
}());

/// End of init();
}

if ((typeof self !== "undefined" && self.location.hash.split(",")[1] === "1") || (typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && !require("worker_threads").isMainThread)) {
    (function ()
    {
        /// Insert worker here
    }());
} else {
    INIT_ENGINE();
}
