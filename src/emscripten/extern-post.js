return Stockfish;
}

if (typeof self !== "undefined" && self.location.hash.split(",")[1] === "worker" || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && !require("worker_threads").isMainThread) {
    (function ()
    {
        /// Insert worker here
    })();
/// Is it a web worker?
} else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined") || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]") {
    (function ()
    {
        var isNode = typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
        var engine = {};
        var startUpQueue = [];
        var queue = [];
        var wasmPath;
        var queueTimer;
        
        function completer(line)
        {
            var completions = [
                "compiler",
                "d",
                "eval",
                "flip",
                "go ",
                "isready",
                "ponderhit",
                "position fen ",
                "position startpos",
                "position startpos moves ",
                "quit",
                "setoption name Clear Hash value true",
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
                return c.toLowerCase().indexOf(line.toLowerCase()) === 0;
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
        
        function sendCommand(cmd)
        {
            ///NOTE: The single-threaded engine needs to specifiy async for "go" commands to prevent memory leaks and other errors.
            engine.ccall("command", null, ["string"], [cmd], {async: typeof IS_ASYNCIFY !== "undefined" && /^go\b/.test(cmd)});
            ///NOTE: The engine must be fully initialized before we can close the Pthreads. so we have to check this here, not in onmessage.sendCommand
            if (cmd === "quit") {
                /// Close the Pthreads.
                try {
                    engine.terminate();
                } catch (e) {}
                try {
                    self.close();
                } catch (e) {}
                try {
                    process.exit();
                } catch (e) {}
            }
            return true;
        }
        
        function processQueue()
        {
            while (queue.length && (!engine._isSearching || !engine._isSearching())) {
                sendCommand(queue.shift());
            }
        }
        
        function processCommand(cmd)
        {
            cmd = cmd.trim();
            /// Certain commands need to be blocked.
            if (cmd.substring(0, 2) === "go" || cmd.substring(0, 9) === "setoption") {
                queue.push(cmd);
            } else {
                sendCommand(cmd);
            }
            processQueue();
        }
        
        function processStartUpQueue()
        {
            var i = 0;
            (function loop()
            {
                var cmd;
                while (i < startUpQueue.length) {
                    cmd = startUpQueue[i++];
                    if (cmd.startsWith("sleep ")) {
                        return setTimeout(loop, cmd.slice(6));
                    } else {
                        processCommand(cmd);
                    }
                }
            }());
        }
        
        function checkIfReady()
        {
            if (engine._isReady && !engine._isReady()) {
                return setTimeout(checkIfReady, 10);
            }
            
            if (typeof IS_ASYNCIFY === "undefined") {
                engine.onDoneSearching = processQueue;
            } else {
                engine.onDoneSearching = function ()
                {
                    /// The delay is only necessary for the single-threaded engine.
                    setTimeout(processQueue, 1);
                };
            }
            engine.processCommand = processCommand;
            if (startUpQueue.length) {
                processStartUpQueue();
            }
        }
        
        if (isNode) {
            /// Was it called directly?
            ///NOTE: Node.js v14-19 needs --experimental-wasm-threads --experimental-wasm-simd
            if (require.main === module) {
                (function ()
                {
                    var p = require("path");
                    
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
                        engine.wasmBinary = (function assembleWASM()
                        {
                            var fs = require("fs");
                            var ext = p.extname(wasmPath);
                            var basename = wasmPath.slice(0, -ext.length);
                            var i;
                            var buffers = [];
                            
                            for (i = 0; i < enginePartsCount; ++i) {
                                buffers.push(fs.readFileSync(basename + "-part-" + i + ".wasm"));
                            }
                            
                            return Buffer.concat(buffers);
                        }());
                    }
                }());
                
                startUpQueue = process.argv.slice(2);
                
                Stockfish = INIT_ENGINE();
                Stockfish(engine).then(checkIfReady);
                
                require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    completer: completer,
                    historySize: 100,
                }).on("line", function online(cmd)
                {
                    if (cmd) {
                        if (engine.processCommand) {
                            engine.processCommand(cmd);
                        } else {
                            startUpQueue.push(cmd);
                        }
                        if (cmd === "quit") {
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
                var progressPort;
                
                function formatSpeed(bytesPerSec)
                {
                    if (bytesPerSec < 1024) {
                        return Math.round(bytesPerSec) + " B/s";
                    }
                    if (bytesPerSec < 1048576) {
                        return (bytesPerSec / 1024).toFixed(1) + " KB/s";
                    }
                    return (bytesPerSec / 1048576).toFixed(1) + " MB/s";
                }
                
                function formatEta(s)
                {
                    if (!s || s < 0) {
                        return "";
                    }
                    if (s < 60) {
                        return Math.ceil(s) + " sec";
                    }
                    return Math.round(s / 60) + " min";
                }
                
                function calcProgressData(loaded, total, startTime)
                {
                    /// To avoid dividing by zero, we round up to 1 ms.
                    var elapsed = (Date.now() - startTime) || 1;
                    var speedBytesPerSec = loaded / (elapsed / 1000);
                    var eta = 0;
                    
                    if (speedBytesPerSec > 0 && loaded < total) {
                        eta = (total - loaded) / speedBytesPerSec;
                    }
                    
                    return {
                        percent: loaded / total,
                        loaded: loaded,
                        total: total,
                        speedBytesPerSec: speedBytesPerSec,
                        speedText: formatSpeed(speedBytesPerSec),
                        eta: eta,
                        etaText: formatEta(eta),
                    };
                }
                
                function loadSplitEngine(onLoaded)
                {
                    function fetchBinary(path, cb, onProg)
                    {
                        var req = new XMLHttpRequest();
                        
                        req.open("GET", path);
                        req.setRequestHeader("Content-Type", "application/octet-stream");
                        req.responseType = "blob";
                        
                        req.send();
                        
                        req.onload = function ()
                        {
                            if (req.status >= 400) {
                                throw new Error("ERROR " + req.status + ": Unable to download " + path);
                            } else {
                                cb(req.response);
                            }
                        };
                        req.onerror = function (err)
                        {
                            throw err;
                        };
                        
                        req.onprogress = onProg;
                    }
                    
                    function loadParts(totalParts)
                    {
                        var doneCount = 0;
                        var i;
                        var parts = [];
                        var ext = wasmPath.slice((wasmPath.lastIndexOf(".") - 1 >>> 0) + 1);
                        var basename = wasmPath.slice(0, -ext.length);
                        var progress = [];
                        var startTime = Date.now();
                        
                        function createOnDownload(num)
                        {
                            return function onDownload(data)
                            {
                                var wasmBlob;
                                ++doneCount;
                                parts[num] = data;
                                if (doneCount === totalParts) {
                                    wasmBlob = URL.createObjectURL(new Blob(parts, {type: "application/wasm"}));
                                    onLoaded(wasmBlob);
                                }
                            };
                        }
                        
                        function updateProgress()
                        {
                            var loaded = 0;
                            progress.forEach(function (el)
                            {
                                loaded += el.loaded;
                            });
                            var data = calcProgressData(loaded, engineTotalBytes, startTime);
                            progressPort.postMessage(data);
                            if (data.percent === 1) {
                                progressPort.close();
                                progressPort = null;
                            }
                        }
                        
                        function createOnProgress(num)
                        {
                            progress[num] = {
                                total: 0,
                                loaded: 0,
                            };
                            return function onProg(e)
                            {
                                progress[num].total = e.total;
                                progress[num].loaded = e.loaded;
                                if (progressPort) {
                                    updateProgress();
                                }
                            }
                        }
                        for (i = 0; i < totalParts; ++i) {
                            fetchBinary(basename + "-part-" + i + ext, createOnDownload(i), createOnProgress(i));
                        }
                    }
                    loadParts(enginePartsCount);
                }
                
                var args = self.location.hash.substr(1).split(",");
                wasmPath = decodeURIComponent(args[0] || location.origin + location.pathname.replace(/\.js$/i, ".wasm"));
                
                if (typeof enginePartsCount === "number") {
                    loadSplitEngine(beginEngineInitialization);
                } else {
                    beginEngineInitialization();
                }
                
                function beginEngineInitialization(wasmBlob)
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
                    };
                    
                    /// If the WASM file is not split, we can process the bytecode while streaming it with WebAssembly.instantiateStreaming().
                    if (typeof enginePartsCount !== "number") {
                        var updateTimer;
                        var updateData;
                        
                        function updateDelayed(data)
                        {
                            updateData = data;
                            if (!updateTimer) {
                                updateTimer = setTimeout(function ()
                                {
                                    updateTimer = null;
                                    progressPort.postMessage(updateData);
                                    
                                    if (updateData.percent >= 1) {
                                        progressPort.close();
                                        progressPort = null;
                                    }
                                }, 4);
                            }
                        }
                        
                        function fetchWasmWithProgress(url, onProgress, onError)
                        {
                            return fetch(url).then(function onFetch(response)
                            {
                                var startTime = Date.now();
                                
                                if (!response.ok) {
                                    throw new Error("HTTP " + response.status + ": " + response.statusText);
                                }
                                
                                var totalBytes = engineTotalBytes;
                                
                                var loadedBytes = 0;
                                var reader = response.body.getReader();
                                
                                var progressStream = new ReadableStream({
                                    start: function (controller)
                                    {
                                        function push()
                                        {
                                            reader.read().then(function onRead(result)
                                            {
                                                var done = result.done;
                                                var value = result.value;
                                                
                                                if (done) {
                                                    onProgress(startTime, totalBytes, totalBytes);
                                                    controller.close();
                                                    return;
                                                }
                                                loadedBytes += value.byteLength;
                                                onProgress(startTime, loadedBytes, totalBytes);
                                                controller.enqueue(value);
                                                push();
                                            }).catch(function onReadError(err)
                                            {
                                                controller.error(err);
                                                if (typeof onError === "function") {
                                                    onError(err);
                                                }
                                            });
                                        }
                                        push();
                                    }
                                });
                                
                                /// Preserve original headers (Wasm compilation is strict about content-type)
                                var headers = new Headers(response.headers);
                                
                                return new Response(progressStream, {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: headers
                                });
                            });
                        }
                        
                        function createProgressHandler()
                        {
                            return function onProgress(startTime, loaded, total)
                            {
                                if (progressPort) {
                                    updateDelayed(calcProgressData(loaded, total, startTime));
                                }
                            };
                        }
                        
                        if (!isASMEngine) {
                            engine.instantiateWasm = function (info, receiveInstance)
                            {
                                var onProgress = createProgressHandler();
                                
                                return fetchWasmWithProgress(wasmPath, onProgress).then(function onFetch(response)
                                {
                                    /// Stream directly to WebAssembly
                                    return WebAssembly.instantiateStreaming(response, info);
                                }).then(function onInstantiate(result)
                                {
                                    /// Hand off to Emscripten
                                    receiveInstance(result.instance, result.module);
                                    return result.instance.exports;
                                }).catch(function onError(e)
                                {
                                    console.error("WASM streaming failed:", e);
                                    throw e;
                                });
                            };
                        }
                    }
                    
                    Stockfish = INIT_ENGINE();
                    
                    Stockfish(engine).then(checkIfReady).catch(function (e)
                    {
                        /// Web Workers will not trigger the error event when errors occur in promises, so we need to create a new context and throw an error there.
                        setTimeout(function throwError()
                        {
                            throw e;
                        }, 1);
                    });
                }
                
                /// Make sure that this is only added once.
                if (!onmessage) {
                    onmessage = function (event)
                    {
                        /// For backwards compatibility, the engine can inform the frontend of the ability to output download progress.
                        if (event.data === "setoption name CanOutputEngineDownloadProgress") {
                            postMessage("info WillOutputEngineDownloadProgress");
                        } else if (event.data.progressPort) {
                            progressPort = event.data.progressPort;
                        } else {
                            if (engine.processCommand) {
                                engine.processCommand(event.data);
                            } else {
                                startUpQueue.push(event.data);
                            }
                            ///NOTE: We check this here, not just in engine.processCommand, because the engine might never finish loading.
                            if (event.data === "quit") {
                                try {
                                    self.close();
                                } catch (e) {}
                            }
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
