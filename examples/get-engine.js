"use strict";

var fs = require("fs");
var p = require("path");

var node_modules = p.join(__dirname, "node_modules");
var basedir = p.join(node_modules, "stockfish");
var bindir = p.join(basedir, "bin");
var stockfishVersion;

function hasEngines()
{
    var moduleConfig;
    var installedModuleConfig;
    try {
        installedModuleConfig = JSON.parse(fs.readFileSync(p.join(basedir, "package.json"), "utf8"));
        moduleConfig = JSON.parse(fs.readFileSync(p.join(__dirname, "..", "package.json"), "utf8"));
    } catch (e) {}
    
    if (moduleConfig) {
        stockfishVersion = moduleConfig.version;
    }
    
    /// Confirm package version.
    if (!installedModuleConfig || !moduleConfig || moduleConfig.version !== installedModuleConfig.version) {
        return false;
    }
    
    /// Make sure the engine files are actually there.
    return fs.existsSync(require(basedir).findEngine());

}

if (!hasEngines()) {
    /// Ensure node_modules exists before installing to get the files into the right place.
    try {
        fs.mkdirSync(node_modules);
    } catch (e) {}
    console.log("-----------------")
    console.log("installing", (stockfishVersion || "latest"))
    console.log("-----------------")
    require("child_process").execFileSync("npm", ["i", "--force", "--no-package-lock", "--no-save", "stockfish@" + (stockfishVersion || "latest")], {cwd: __dirname});
    if (!hasEngines()) {
        console.error("Could not find stockfish engine.");
        process.exit(1);
    }
}
