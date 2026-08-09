#!/usr/bin/env node

"use strict";

var assert = require("assert");
var fs = require("fs");
var os = require("os");
var path = require("path");
var vm = require("vm");

var preJs = fs.readFileSync(path.join(__dirname, "..", "src", "emscripten", "pre.js"), "utf8");
var tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "stockfish-node-fetch-"));
var enginePath = path.join(tempDir, "stockfish-test.js");
var wasmPath = path.join(tempDir, "stockfish-test.wasm");
var wasmBinary = Buffer.from([0, 97, 115, 109]);
var splitWasmBinary = Buffer.from([1, 2, 3, 4]);
var originalFetch = function () {};
var locatedWasmName;
var sandbox = {
    Buffer: Buffer,
    Module: {
        locateFile: function (name)
        {
            locatedWasmName = name;
            return wasmPath;
        }
    },
    __filename: enginePath,
    console: console,
    fetch: originalFetch,
    process: process,
    require: require
};

fs.writeFileSync(wasmPath, wasmBinary);

try {
    vm.runInNewContext(preJs, sandbox, {filename: "pre.js"});

    assert.strictEqual(sandbox.fetch, originalFetch, "global fetch must not be replaced");
    assert.strictEqual(Object.prototype.hasOwnProperty.call(sandbox, "XMLHttpRequest"), false,
        "initialization must not install global XMLHttpRequest");
    assert.strictEqual(locatedWasmName, "stockfish-test.wasm");
    assert.deepStrictEqual(Buffer.from(sandbox.Module.wasmBinary), wasmBinary,
        "the adjacent WebAssembly binary should be provided to Emscripten");

    sandbox = {
        Module: {wasmBinary: splitWasmBinary},
        __filename: enginePath,
        console: console,
        fetch: originalFetch,
        process: process,
        require: require
    };
    vm.runInNewContext(preJs, sandbox, {filename: "pre.js"});

    assert.strictEqual(sandbox.fetch, originalFetch);
    assert.strictEqual(sandbox.Module.wasmBinary, splitWasmBinary,
        "a WebAssembly binary assembled from split parts must be preserved");
} finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
}

console.log("Node global fetch regression test passed.");
