#!/usr/bin/env node

/// License: MIT

var execFileSync = require("child_process").execFileSync;
var enginePath = require("./findEngine.js")();

execFileSync(process.execPath, [enginePath], {stdio: "inherit"});
