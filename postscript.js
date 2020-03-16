return Stockfish;
/// End of STOCKFISH()
};


(function ()
{
    var isNode;
    var args;
    
    var myConsole = {
        log: log,
        error: log,
        warn: log,
    }
    
    function log(line)
    {
        console.log("------>", line)
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
            /// Is it a pThread or was it called directly?
            if (typeof module === "undefined" || require.main === module) {
                Stockfish = STOCKFISH(myConsole/*, require("path").join(__dirname, "stockfish.wasm")*/);
                //console.log(Stockfish)
                Stockfish().then(function (sf)
                {
                    function exit()
                    {
                        sf.PThread.terminateAllThreads();
                        process.exit();
                    }
                    
                    sf.addMessageListener(function onlog(line)
                    {
                        console.log(line);
                    });
                    
                    require("readline").createInterface({
                        input: process.stdin,
                        output: process.stdout,
                        completer: completer,
                        historySize: 100,
                    }).on("line", function online(line)
                    {
                        if (line) {
                            if (line === "quit" || line === "exit") {
                                exit();
                            }
                            sf.postMessage(line, true);
                        }
                    }).on("SIGINT", exit).on("close", exit).setPrompt("");
                    
                    process.stdin.on("end", function onend()
                    {
                        process.exit();
                    });
                });
            /// Is this a node module?
            } else {
                module.exports = STOCKFISH;
            }
        
    /// Is it a web worker?
    } else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined")) {
        if (self && self.location && self.location.hash) {
            args = self.location.hash.split(",");
            Stockfish = STOCKFISH(myConsole, args[0], Boolean(args[1]));
        } else {
            Stockfish = STOCKFISH(myConsole);
        }
        
        Stockfish().then(function (sf)
        {
            onmessage = function(event) {
                sf.postMessage(event.data, true);
            };
            
            sf.addMessageListener(function onlog(line)
            {
                postMessage(line);
            });
        });
    }
    ///NOTE: If it's a normal browser, we don't need to do anything. The client can use the STOCKFISH() function directly.
}());

