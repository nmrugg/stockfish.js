return Stockfish;
}
if (typeof self !== "undefined" && self.location.hash.split(",")[1] === "worker" || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && !require("worker_threads").isMainThread) {
    (function() {
        /// Insert worker here
    })();
} else {
    Stockfish = INIT_ENGINE();
}
