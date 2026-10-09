# Stockfish.js

[Stockfish.js](https://github.com/nmrugg/stockfish.js) is a WASM implementation by Nathan Rugg of the [Stockfish](https://github.com/official-stockfish/Stockfish) chess engine. It is written for [Chess.com's](https://www.chess.com/analysis) in-browser engine and is maintained as a general purpose project.

Stockfish.js is currently updated to Stockfish 19.

Prebuilt engines are published to [npm](https://www.npmjs.com/package/stockfish) and to the [releases page](https://github.com/nmrugg/stockfish.js/releases). Please file bugs on the [issue tracker](https://github.com/nmrugg/stockfish.js/issues).

## The Engines

This edition of Stockfish.js comes in five flavors:

| Engine | Size (js + wasm) | Threads | Needs cross-origin isolation | Files |
| --- | --- | --- | --- | --- |
| Full | ≈94MB | Yes | Yes | [`stockfish-19.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19.js) and [`stockfish-19.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19.wasm) |
| Full, single-threaded | ≈94MB | No | No | [`stockfish-19-single.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-single.js) and [`stockfish-19-single.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-single.wasm) |
| Lite | ≈1.6MB | Yes | Yes | [`stockfish-19-lite.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-lite.js) and [`stockfish-19-lite.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-lite.wasm) |
| Lite, single-threaded | ≈1.7MB | No | No | [`stockfish-19-lite-single.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-lite-single.js) and [`stockfish-19-lite-single.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-lite-single.wasm) |
| ASM-JS | ≈3MB | No | No | [`stockfish-19-asm.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1/stockfish-19-asm.js) |

A few notes on the table:

 * The multi-threaded engines need the page to be [cross-origin isolated](https://web.dev/articles/cross-origin-isolation-guide) so that `SharedArrayBuffer` is available. The server must send both `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. You can check the current page with `crossOriginIsolated` in the browser console. The demo server in `examples/` sends these headers automatically.
 * The single-threaded engines run without those headers, but the UCI command `setoption name Threads` has no effect on them.
 * The lite engines use a much smaller neural network, so they are far smaller and quite a bit weaker.
 * The ASM-JS engine is compiled to JavaScript, not WASM. It runs in essentially any browser or runtime that supports JavaScript. It is very slow and weak, and it is larger than the lite WASM engines. Use it only as a last resort.

### Which engine should I use?

It depends on your project, but most likely, you should use the `lite single-threaded` engine because it is fast and does not require any complicated setup. Although the full engine is objectively stronger, the lite engine is still far stronger than any human will ever be, and the full engine is so large that it can be very slow to load, which would cause a poor user experience.

The WASM Stockfish engines will run on all modern browsers (e.g., Chrome/Edge/Firefox/Opera/Safari) on supported systems (Windows 10+/macOS 11+/iOS 16+/Linux/Android), as well as currently supported versions of Node.js. Node.js 14 through 18 need `--experimental-wasm-threads --experimental-wasm-simd` for the multi-threaded engines. For slightly older browsers, see the [Stockfish.js 16 branch](../../tree/Stockfish16). The ASM-JS engine will run in essentially any browser/runtime that supports JavaScript. For an engine that supports chess variants (like three-check and crazyhouse), see the [Stockfish.js 11 branch](../../tree/Stockfish11).

## How do I use stockfish.js?

Stockfish.js is a raw engine. It speaks the UCI chess engine protocol over stdin and stdout in Node.js, and over `postMessage` in the browser. You need to bring the rest of the parts to make it into a working vehicle.

### Node.js (npm)

The engines are published to npm as [`stockfish`](https://www.npmjs.com/package/stockfish), and the package contains all five flavors.

```bash
npm install stockfish
```

The package also provides a `stockfish` command, so you can install it globally and use the engine interactively:

```bash
npm install -g stockfish
stockfish
```

To use the engine from a script, `require()` it as a CommonJS module:

```js
var stockfish = require("stockfish")("lite-single", function onMessage(line) {
    console.log("STDOUT:", line);
    if (/bestmove \S+/.test(line)) {
        console.log("The best move is " + line.match(/bestmove (\S+)/)[1] + ".");
        stockfish.terminate();
    }
});

stockfish.processCommand("uci");
stockfish.processCommand("go depth 10");
```

The first argument selects which engine to load. It can be a keyword (`"full"`, `"lite"`, `"single"`, `"lite-single"`, `"asm"`) or a path to any stockfish.js engine file. If you leave it out, the full engine is used. Call `terminate()` when you are done so the process exits.

If you would rather spawn the engine yourself, `findEngine()` gives you the path to the engine file:

```js
var enginePath = require("stockfish").findEngine("lite-single");
var child = require("child_process").spawn(process.execPath, [enginePath], {stdio: "pipe"});
```

### Browser

```js
var worker = new Worker("stockfish-19-lite-single.js");

worker.onmessage = function (ev) {
    console.log(ev.data);
};

worker.postMessage("uci");
worker.postMessage("position startpos");
worker.postMessage("go depth 10");
```

The `.js` file expects the matching `.wasm` file to sit next to it, and both files must be served with the correct MIME types (`text/javascript` and `application/wasm`). The `lite single-threaded` engine works on any static host with no special configuration.

### The loadEngine abstraction

`examples/loadEngine.js` is a small abstraction layer that works in both Node.js and the browser. It queues commands, matches output back to the command that produced it, streams `info` lines, reports engine download progress, and works with any UCI compatible engine, including native binaries.

The [examples folder](https://github.com/nmrugg/stockfish.js/tree/master/examples) and `examples/README.md` show it in use.

## How do I compile the engine?

You only need to compile the engine if you want to make changes to the engine itself.

In order to compile the engine, you need to have [emscripten `6.0.9`](https://emscripten.org/docs/getting_started/downloads.html) installed and in your path. `build.js` checks your version and warns if it does not match. Add `--skip-em-check` to bypass the check, or `--strict-em-check` to turn a mismatch (or an unconfirmed version) into an error.

Then you can compile Stockfish.js with the build script:

```bash
./build.js --help     # every option, with examples
./build.js            # the multi-threaded WASM engine
./build.js --all      # all five flavors
./build.js --bin      # a native (non-WASM) Stockfish binary
```

Built files are written to `src/`, which you can change with `--output-dir=dir`. The npm scripts mirror the most common flavors: `npm run build`, `npm run build-lite`, `npm run build-single`, `npm run build-single-lite`.

A few things worth knowing:

 * Syzygy tablebase probing is stripped from the WASM builds by default. Add `--keep-syzygy` to include it.
 * `--split=6` splits the WASM file into several parts, which can help browsers and CDNs that are slow with very large files. `--no-split` disables splitting.
 * `--hash` appends a content hash to the generated file names, and `--version=` changes the version number used in them.

## Repository layout

| Path | Description |
| --- | --- |
| `src/` | The Stockfish C++ source, the emscripten glue code in `src/emscripten/`, and everything `build.js` produces |
| `build.js` | The build script (see `./build.js --help`) |
| `index.js` | The Node.js interface that the npm package exposes, `require("stockfish")` |
| `scripts/findEngine.js` | Resolves an engine keyword or path to an engine file |
| `scripts/cli.js` | Implements the `stockfish` command |
| `scripts/prepack.js` | Builds all flavors and copies them into `bin/` before packaging (`bin/` is not in git) |
| `examples/` | Web and Node.js examples, plus the demo server |
| `tests/`, `tester.js` | Simple engine tests |

## Thanks

- <a href="https://github.com/exoticorn/stockfish-js">exoticorn</a> for the original Stockfish to JS conversion
- <a href="https://github.com/ddugovic/Stockfish">ddugovic</a> for his Stockfish with many variants
- <a href="https://github.com/niklasf/">niklasf</a> for his <a href="https://github.com/niklasf/stockfish.js">stockfish.js</a> & <a href="https://github.com/niklasf/stockfish.wasm">stockfish.wasm</a>
- <a href="https://github.com/hi-ogawa/Stockfish">hi-ogawa</a> for his optimizations
- <a href="https://github.com/linrock">linrock</a> for older <a href="https://tests.stockfishchess.org/nns?network_name=nn-9067e33176e">lite nets</a>
- <a href="https://github.com/sscg13/Stockfish/tree/sf19-1mb">sscg13</a> for Stockfish 19 <a href="https://tests.stockfishchess.org/nns?network_name=nn-61e7af4bb97d">lite nets</a>
- <a href="https://github.com/lichess-org/stockfish-web">Lichess WASM Builds</a> for their patches
- <a href="https://github.com/official-stockfish/Stockfish">The Stockfish team</a> for everything

See <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/AUTHORS">AUTHORS</a> for more credits.

## License

Stockfish.js engine code is GPL v3 (see <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/Copying.txt">Copying.txt</a>). The published npm package is licensed under GPL-3.0 because it contains the engine.

The non-engine code is MIT licensed.
