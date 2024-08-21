self._origOnmessage = self.onmessage;
self.onmessage = function (e)
{
    if (e.data.cmd === "load") {
        // Preload command that is called once per worker to parse and load the Emscripten code.
        // Module and memory were sent from main thread
        Module["wasmModule"] = e.data.wasmModule;
        Module["wasmMemory"] = e.data.wasmMemory;
        Module["buffer"] = Module["wasmMemory"].buffer;
        Module["ENVIRONMENT_IS_PTHREAD"] = true;
        if (e.data.workerID) {
            Module['workerID'] = e.data.workerID;
        }
        if (e.data.wasmSourceMap) {
            Module['wasmSourceMapData'] = e.data.wasmSourceMap;
        }
        if (e.data.wasmOffsetConverter) {
            Module['wasmOffsetData'] = e.data.wasmOffsetConverter;
        }
        Stockfish = INIT_ENGINE();
        Stockfish(Module).then(function (instance)
        {
            Module = instance;
        });
    } else {
        self._origOnmessage(e);
    }
};
