### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a WASM implementation of <a href="https://github.com/official-stockfish/Stockfish">Stockfish</a> chess engine.

Stockfish.js is currently updated to Stockfish 16.

This edition of Stockfish.js comes in four flavors.

 * The full mult-threaded engine:
    * This is best version of the engine but will only run in new browsers with the proper CORS headers applied.
    * Files: stockfish-nnue-16.js & stockfish-nnue-16.wasm
 * The single-threaded engine:
    * This will run in most browsers but is not as responsive as the multi-threaded version.
    * Files: stockfish-nnue-16-single.js & stockfish-nnue-16-single.wasm
 * The mult-threaded non-SIMD engine:
    * Requires CORS headers but will run on older browsers that do not support SIMD (such as older Safari):
    * Files: stockfish-nnue-16-no-simd.js & stockfish-nnue-16-no-simd.wasm
 * The mult-threaded non-nested worker:
    * Designed specifically to workaround a bug in Chrome 109. Requires CORS headers.
    * Files: stockfish-nnue-16-no-Worker.js & stockfish-nnue-16-no-Worker.wasm

For older WASM engines or a pure ASM.JS engine, see the <a href=../../tree/Stockfish11>Stockfish.js 11 branch</a>.

### Compiling

You need to have the <a href="http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html">emscripten</a> compiler installed and in your path (tested with `2.0.26`). Then you can compile Stockfish.js with the build script: `./build.js`. See `./build.js --help` for details.

### Example

There are examples in the example folder. You will need to run the example/server.js server to view the client-side examples.

There are also example using Node.js.

### Thanks

- <a href="https://github.com/mcostalba/Stockfish">The Stockfish team</a>
- <a href="https://github.com/exoticorn/stockfish-js">exoticorn</a>
- <a href="https://github.com/ddugovic/Stockfish">ddugovic</a>
- <a href="https://github.com/niklasf/">niklasf</a> <a href="https://github.com/niklasf/stockfish.js">stockfish.js</a> & <a href="https://github.com/niklasf/stockfish.wasm">stockfish.wasm</a>
- <a href="https://github.com/hi-ogawa/Stockfish">hi-ogawa</a> (faster WASM NNUE evaluation)

### License

GPLv3 (see <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/license.txt">license.txt</a>)
