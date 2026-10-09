/// License: MIT

"use strict";

var findEngine = require("./scripts/findEngine.js");

///NOTE: If enginePath is not passed in, it will use the default stockfish.js engine.
function initEngine(enginePath, onMessage)
{
    if (typeof enginePath === "function") {
        onMessage = enginePath;
        enginePath = "";
    }
    var pathToEngine = findEngine(enginePath);
    var engine = require(pathToEngine)();
    if (typeof onMessage === "function") {
        engine.listener = onMessage;
    }
    return engine;
}

initEngine.findEngine = findEngine;

module.exports = initEngine;
