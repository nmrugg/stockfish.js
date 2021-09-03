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
        var mod;
        var myEngine;
        var queue = [];
        var args;
        var wasmPath;
        
        ///TODO: Node.js support
        if (!isNode) {
            args = self.location.hash.substr(1).split(",");
            wasmPath = decodeURIComponent(args[0] || "stockfish.wasm");
            mod = {
                locateFile: function (path)
                {
                    if (path.indexOf(".wasm") > -1) {
                        /// Set the path to the wasm binary.
                        return wasmPath;
                    } else {
                        /// Set path to worker (self + the worker hash)
                        return self.location.origin + self.location.pathname + "#" + wasmPath + ",worker";
                    }
                }
            };
            Stockfish = INIT_ENGINE();
            Stockfish(mod).then(sf => {
                myEngine = sf;
                sf.addMessageListener((line) => {
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
        }
    }());
} else {
    ///NOTE: If it's a normal browser, the client can use the Stockfish() function directly.
    Stockfish = INIT_ENGINE();
}
