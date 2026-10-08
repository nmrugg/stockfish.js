### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a WASM implementation by Nathan Rugg of the <a href="https://github.com/official-stockfish/Stockfish">Stockfish</a> chess engine, for [Chess.com's](https://www.chess.com/analysis) in-browser engine.

Stockfish.js is currently updated to Stockfish 19.

This edition of Stockfish.js comes in five flavors:

 * The large multi-threaded engine:
    * This is the strongest version of the engine, but it is very large (≈94MB) and will only run in browsers with the proper <a href=https://web.dev/articles/cross-origin-isolation-guide>CORS headers</a> applied.
    * Files: [`stockfish-19.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19.js) & [`stockfish-19.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19.wasm)
 * The large single-threaded engine:
    * This is also large but will run in browsers without CORS headers; however it cannot use multiple threads via the UCI command `setoption name Threads`.
    * Files: [`stockfish-19-single.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-single.js) & [`stockfish-19-single.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-single.wasm)
 * The lite multi-threaded engine:
    * This is the same as the first multi-threaded but much smaller (≈1.6MB) and quite a bit weaker.
    * Files: [`stockfish-19-lite.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-lite.js) & [`stockfish-19-lite.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-lite.wasm)
 * The lite single-threaded engine:
    * Same as the first single-threaded engine but much smaller (≈1.6MB) and quite a bit weaker.
    * Files: [`stockfish-19-lite-single.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-lite-single.js) & [`stockfish-19-lite-single.wasm`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-lite-single.wasm)
 * The ASM-JS engine:
    * Compiled to JavaScript, not WASM. Compatible with every browser that runs JavaScript. Very slow and weak. Larger than the lite WASM engines (≈3MB). This engine should only be used as a last resort.
    * File: [`stockfish-19-asm.js`](https://github.com/nmrugg/stockfish.js/releases/download/v19.0.0/stockfish-19-asm.js)

#### Which engine should I use?

It depends on your project, but most likely, you should use the `lite single-threaded` engine because it is fast and does not require any complicated setup. Although the full engine is objectively stronger, the lite engine is still far stronger than any human will ever be, and the full engine is so large that it can be very slow to load, which would cause a poor user experience.

The WASM Stockfish engines will run on all modern browsers (e.g., Chrome/Edge/Firefox/Opera/Safari) on supported systems (Windows 10+/macOS 11+/iOS 16+/Linux/Android), as well as currently supported versions of Node.js. For slightly older browsers, see the <a href=../../tree/Stockfish16>Stockfish.js 16 branch</a>. The ASM-JS engine will run in essentially any browser/runtime that supports JavaScript. For an engine that supports chess variants (like three-check and crazyhouse), see the <a href=../../tree/Stockfish11>Stockfish.js 11 branch</a>.

### How do I use stockfish.js?

Stockfish.js is simply a raw engine. You'll need to bring the rest of the parts to make it into a working vehicle.

To learn how to use the engine in your own projects, see the <a href="https://github.com/nmrugg/stockfish.js/tree/master/examples">examples folder</a>. In particular, see `examples/loadEngine.js` for a sample implementation of how to load and run engines.

### How do I compile the engine?

You only need to compile the engine if you want to make changes to the engine itself.

In order to compile the engine, you need to have <a href="https://emscripten.org/docs/getting_started/downloads.html">emscripten `6.0.9`</a> installed and in your path. Then you can compile Stockfish.js with the build script: `./build.js`. See `./build.js --help` for details. To build all flavors, run `./build.js --all`.

### Thanks

- <a href="https://github.com/exoticorn/stockfish-js">exoticorn</a> for the original Stockfish to JS conversion
- <a href="https://github.com/ddugovic/Stockfish">ddugovic</a> for his Stockfish with many variants
- <a href="https://github.com/niklasf/">niklasf</a> for his <a href="https://github.com/niklasf/stockfish.js">stockfish.js</a> & <a href="https://github.com/niklasf/stockfish.wasm">stockfish.wasm</a>
- <a href="https://github.com/hi-ogawa/Stockfish">hi-ogawa</a> for his optimizations
- <a href="https://github.com/linrock">linrock</a> for older <a href="https://tests.stockfishchess.org/nns?network_name=nn-9067e33176e">lite nets</a>
- <a href="https://github.com/sscg13/Stockfish/tree/sf19-1mb">sscg13</a> for Stockfish 19 <a href="https://tests.stockfishchess.org/nns?network_name=nn-61e7af4bb97d">lite nets</a>
- <a href="https://github.com/lichess-org/stockfish-web">Lichess WASM Builds</a> for their patches
- <a href="https://github.com/official-stockfish/Stockfish">The Stockfish team</a> for everything

See <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/AUTHORS">AUTHORS</a> for more credits.

### License

Stockfish.js (c) 2026, Chess.com, LLC
GPLv3 (see <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/Copying.txt">Copying.txt</a>)
