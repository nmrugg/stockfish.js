"use strict";

var fs = require("fs");
var p = require("path");

function findEngine(type)
{
    var version = require("../package.json").buildVersion;
    var filename;
    var path;
    
    switch((type || "full").toLowerCase()) {
        case "full":
            filename = "stockfish-" + version + ".js";
            break;
        case "lite":
            filename = "stockfish-" + version + "-lite.js";
            break;
        case "single":
            filename = "stockfish-" + version + "-single.js";
            break;
        case "lite-single":
        case "single-lite":
            filename = "stockfish-" + version + "-lite-single.js";
            break;
        case "asm":
            filename = "stockfish-" + version + "-asm.js";
            break;
        default:
            /// If it is not a keyword, then it should be the path to the engine.
            filename = type;
            path = p.resolve(process.cwd(), filename);
            if (fs.existsSync(path)) {
                return path;
            }
    }
    
    path = p.join(__dirname, "..", "bin", filename);
    if (fs.existsSync(path)) {
        return path;
    }
    
    path = p.join(__dirname, "..", "src", filename);
    if (fs.existsSync(path)) {
        return path;
    }
    
    /// Fallback to stockfish.js
    path = p.join(__dirname, "..", "src", "stockfish.js");
    if (fs.existsSync(path)) {
        return path;
    }
    
    throw new Error("Cannot find " + filename + ". Please provide the path to the engine. You may need to build the engine first.");
}

module.exports = findEngine;
