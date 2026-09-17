
/// Node 18+ exposes fetch(), but Emscripten 3.1.7 may try to use it with a
/// local filesystem path. Provide the local binary without changing globals.
if (typeof process === "object" &&
        process !== null &&
        typeof process.versions === "object" &&
        process.versions !== null &&
        typeof process.versions.node === "string" &&
        typeof require === "function" &&
        typeof fetch === "function" &&
        typeof Module["wasmBinary"] === "undefined" &&
        typeof __filename === "string") {
    (function loadNodeWasmBinary()
    {
        var fs = require("fs");
        var path = require("path");
        var wasmName = path.basename(__filename, path.extname(__filename)) + ".wasm";
        var wasmPath = Module["locateFile"] ?
            Module["locateFile"](wasmName, path.dirname(__filename) + path.sep) :
            path.join(path.dirname(__filename), wasmName);

        if (typeof wasmPath === "string" && fs.existsSync(wasmPath)) {
            Module["wasmBinary"] = fs.readFileSync(wasmPath);
        }
    }());
}

Module["print"] = function (data)
{
    if (Module["listener"]) {
        Module["listener"](data);
    } else {
        console.log(data);
    }
}
Module["printErr"] = function (data)
{
    if (Module["listener"]) {
        Module["listener"](data);
    } else {
        console.error(data);
    }
}

Module["terminate"] = function ()
{
    if (typeof PThread !== "undefined") {
        PThread.terminateAllThreads();
    }
};
