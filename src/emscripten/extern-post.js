return Stockfish;
}

if (typeof self !== "undefined" && self.location.hash.split(",")[1] === "worker" || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && !require("worker_threads").isMainThread) {
    (function() {
        /// Insert worker here
    })();
/// Is it a web worker?
} else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined") || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]") {
    (function ()
    {
        var isNode = typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
        var engine = {};
        var queue = [];
        var wasmPath;
        
        function completer(line)
        {
            var completions = [
                "compiler",
                "d",
                "eval",
                "exit",
                "flip",
                "go ",
                "isready ",
                "ponderhit ",
                "position fen ",
                "position startpos",
                "position startpos moves",
                "quit",
                "setoption name Clear Hash value true",
                "setoption name Contempt value ",
                "setoption name Hash value ",
                "setoption name Minimum Thinking Time value ",
                "setoption name Move Overhead value ",
                "setoption name MultiPV value ",
                "setoption name Ponder value ",
                "setoption name Skill Level value ",
                "setoption name Slow Mover value ",
                "setoption name Threads value ",
                "setoption name UCI_Chess960 value false",
                "setoption name UCI_Chess960 value true",
                "setoption name UCI_LimitStrength value true",
                "setoption name UCI_LimitStrength value false",
                "setoption name UCI_Elo value ",
                "setoption name UCI_ShowWDL value true",
                "setoption name UCI_ShowWDL value false",
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
        
        if (isNode) {
            ///NOTE: Node.js v14-19 needs --experimental-wasm-threads --experimental-wasm-simd
            /// Was it called directly?
            if (require.main === module) {
                (function ()
                {
                    var p = require("path");
                    
                    function assembleWASM(count)
                    {
                        var fs = require("fs");
                        var ext = p.extname(wasmPath);
                        var basename = wasmPath.slice(0, -ext.length);
                        var i;
                        var buffers = [];
                        
                        for (i = 0; i < count; ++i) {
                            buffers.push(fs.readFileSync(basename + "-part-" + i + ".wasm"));
                        }
                        
                        return Buffer.concat(buffers);
                    }
                    wasmPath = p.join(__dirname, p.basename(__filename, p.extname(__filename)) + ".wasm");
                    engine = {
                        locateFile: function (path)
                        {
                            if (path.indexOf(".wasm") > -1) {
                                if (path.indexOf(".wasm.map") > -1) {
                                    /// Set the path to the wasm map.
                                    return wasmPath + ".map"
                                }
                                /// Set the path to the wasm binary.
                                return wasmPath;
                            }
                            /// Set path to worker
                            
                            return __filename;
                        },
                        listener: function onMessage(line)
                        {
                            process.stdout.write(line + "\n");
                        },
                    };
                    
                    if (typeof enginePartsCount === "number") {
                        /// Prepare the wasm data because it is in parts.
                        engine.wasmBinary = assembleWASM(enginePartsCount);
                    }
                }());
                
                Stockfish = INIT_ENGINE();
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
                        ///NOTE: The single-threaded engine needs to specifiy async for "go" commands to prevent memory leaks and other errors.
                        engine.ccall("command", null, ["string"], [cmd], {async: typeof IS_ASYNCIFY !== "undefined" && /^go\b/.test(cmd)});
                    };
                    
                    queue.forEach(engine.sendCommand);
                    queue = null;
                });
                
                require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    completer: completer,
                    historySize: 100,
                }).on("line", function online(cmd)
                {
                    if (cmd) {
                        if (engine.sendCommand) {
                            engine.sendCommand(cmd);
                        } else {
                            queue.push(cmd);
                        }
                        if (cmd === "quit" || cmd === "exit") {
                            process.exit();
                        }
                    }
                }).on("close", function onend()
                {
                    process.exit();
                }).setPrompt("");
                
            /// Is this a node module?
            } else {
                module.exports = INIT_ENGINE;
            }
        } else {
            (function ()
            {
                var wasmBlob;
                
                function loadBinary(onLoaded)
                {
                    function fetchBinary(path, cb)
                    {
                        fetch(new Request(path)).then(function (response)
                        {
                            return response.blob();
                        }).then(function (wasmData)
                        {
                            cb(wasmData);
                        });
                    }
                    function loadParts(total)
                    {
                        var doneCount = 0;
                        var i;
                        var parts = [];
                        var ext = wasmPath.slice((wasmPath.lastIndexOf(".") - 1 >>> 0) + 1);
                        var basename = wasmPath.slice(0, -ext.length);
                        
                        function createOnDownload(num)
                        {
                            return function onDownload(data)
                            {
                                var wasmBlob;
                                ++doneCount;
                                parts[num] = data;
                                if (doneCount === total) {
                                    wasmBlob = URL.createObjectURL(new Blob(parts));
                                    onLoaded(wasmBlob);
                                }
                            };
                        }
                        for (i = 0; i < total; ++i) {
                            fetchBinary(basename + "-part-" + i + ext, createOnDownload(i));
                        }
                    }
                    if (typeof enginePartsCount === "number") {
                        loadParts(enginePartsCount);
                    } else {
                        onLoaded();
                    }
                }
                
                var args = self.location.hash.substr(1).split(",");
                wasmPath = decodeURIComponent(args[0] || location.origin + location.pathname.replace(/\.js$/i, ".wasm"));
                
                loadBinary(function (wasmBlob)
                {
                    engine = {
                        locateFile: function (path)
                        {
                            if (path.indexOf(".wasm") > -1) {
                                if (path.indexOf(".wasm.map") > -1) {
                                    /// Set the path to the wasm map.
                                    return wasmPath + ".map"
                                }
                                /// Set the path to the wasm binary.
                                return wasmBlob || wasmPath;
                            }
                            /// Set path to worker (self + the worker hash)
                            return self.location.origin + self.location.pathname + "#" + wasmPath + ",worker";
                        },
                        listener: function onMessage(line)
                        {
                            postMessage(line);
                        },
                    }
                    Stockfish = INIT_ENGINE();
                
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
                            ///NOTE: The single-threaded engine needs to specifiy async for "go" commands to prevent memory leaks and other errors.
                            engine.ccall("command", null, ["string"], [cmd], {async: typeof IS_ASYNCIFY !== "undefined" && /^go\b/.test(cmd)});
                            ///NOTE: The engine must be fully initialized before we can close the Pthreads. so we have to check this here, not in onmessage.
                            if (cmd === "quit" || cmd === "exit") {
                                /// Close the Pthreads.
                                try {
                                    engine.terminate();
                                } catch (e) {}
                            }
                        };
                        queue.forEach(engine.sendCommand);
                        queue = null;
                    }).catch(function (e)
                    {
                        /// Sadly, Web Workers will not trigger the error event when errors occur in promises, so we need to create a new context and throw an error there.
                        setTimeout(function throwError()
                        {
                            throw e;
                        }, 1);
                    });
                });
                
                /// Make sure that this is only added once.
                if (!onmessage) {
                    onmessage = function (event)
                    {
                        if (engine.sendCommand) {
                            engine.sendCommand(event.data);
                        } else {
                            queue.push(event.data);
                        }
                        ///NOTE: We check this here, not just in engine.sendCommand, because the engine might never finish loading.
                        if (event.data === "quit" || event.data === "exit") {
                            /// Exit the Web Worker.
                            try {
                                self.close();
                            } catch (e) {}
                        }
                    };
                }
            }());
        }
    }());
} else {
    ///NOTE: If it's a normal browser, the client can use the engine without polluting the global scope.
    if (typeof document === "object" && document.currentScript) {
        document.currentScript._exports = INIT_ENGINE();
    } else {
        Stockfish = INIT_ENGINE();
    }
}
}());
