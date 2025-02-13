### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a WASM implementation by Nathan Rugg of the <a href="https://github.com/official-stockfish/Stockfish">Stockfish</a> chess engine, currently used by [Chess.com](https://www.chess.com/) for in-browser engine use.

Stockfish.js is currently updated to Stockfish 17.

This edition of Stockfish.js comes in five flavors:

 * The large multi-threaded engine:
    * This is strongest version of the engine, but it is large (≈66MB) and will only run in browsers with the proper <a href=https://web.dev/articles/cross-origin-isolation-guide>CORS headers</a> applied. This engine is recommended if possible.
    * Files: `stockfish-nnue-17.js` & `stockfish-nnue-17-part-\d.wasm`
 * The large single-threaded engine:
    * This is also large but will run in browsers without CORS headers; however it cannot use multiple threads via the UCI command `setoption name Threads`. This engine is recommended if CORS support is not possible.
    * Files: `stockfish-nnue-17-single.js` & `stockfish-nnue-17-single-part-\d.wasm`
 * The lite mult-threaded engine:
    * This is the same as the first multi-threaded but much smaller (≈6MB) and quite a bit weaker. This engine is recommended for mobile browsers when CORS is available.
    * Files: `stockfish-nnue-17-lite.js` & `stockfish-nnue-17-lite.wasm`
 * The lite single-threaded engine:
    * Same as the first single-threaded engine but much smaller (≈6MB) and quite a bit weaker. This engine is recommended for mobile browsers that do not support CORS.
    * Files: `stockfish-nnue-17-lite-single.js` & `stockfish-nnue-17-lite-single.wasm`
 * The ASM-JS engine:
    * Compiled to JavaScript, not WASM. Compatible with every browser that runs JavaScript. Very slow and weak. Larger than the lite WASM engines (≈9MB). This engine should only be used as a last resort.
    * File: `stockfish-17-asm.js`


> [!IMPORTANT]
> Due to the difficulty in handling and caching large files, the larger WASM files are split into parts. All parts are required to be in the same location and will be automatically assembled by the engine.

The ASM-JS engine will run in any browser that supports JavaScript. The WASM Stockfish.js 17 will run on all modern browsers (Chrome/Edge/Firefox/Opera/Safari) on supported system (Windows 10+/macOS 11+/iOS 16+/Linux/Android), as well as supported versions of Node.js. For slightly older browsers, see the <a href=../../tree/Stockfish16>Stockfish.js 16 branch</a>. For an engine that supports chess variants (like 3-check and Crazyhouse), see the <a href=../../tree/Stockfish11>Stockfish.js 11 branch</a>.

### API

In the browser, it is recommended to use the engine via Web Workers. See `examples/loadEngine.js` for a sample implementation.

You can also run Stockfish.js directly from the command line with Node.js 14.4+. You may need to add some command line flags to get it to run:

```shell
node src/stockfish.js
```
Stockfish.js can be found in the npm repository and installed like this: `npm install stockfish`.

If you want to use it from the command line, you may want to simply install it globally: `npm install -g stockfish`. Then you can simply run `stockfishjs`.

In Node.js, you can either run it directly from the command line (i.e., `node src/stockfish.js`) or require() it as a module (i.e., `var stockfish = require("stockfish");`).

### Compiling

You need to have the <a href="http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html">emscripten</a> compiler installed and in your path (tested with `2.0.27`). Then you can compile Stockfish.js with the build script: `./build.js`. See `./build.js --help` for details. To build all flavors, run `./build.js –all`.

### Examples

There are examples in the examples folder. You will need to run the examples/server.js server to view the client-side examples. Then you can test out a simple interface at http://localhost:9091/ or a more complete demo at http://localhost:9091/demo.html.

There are also examples of how to use Stockfish.js via Node.js.

### Thanks

- <a href="https://github.com/official-stockfish/Stockfish">The Stockfish team</a>
- <a href="https://github.com/exoticorn/stockfish-js">exoticorn</a>
- <a href="https://github.com/ddugovic/Stockfish">ddugovic</a>
- <a href="https://github.com/niklasf/">niklasf</a> <a href="https://github.com/niklasf/stockfish.js">stockfish.js</a> & <a href="https://github.com/niklasf/stockfish.wasm">stockfish.wasm</a>
- <a href="https://github.com/hi-ogawa/Stockfish">hi-ogawa</a>
- <a href="https://github.com/linrock">linrock</a>

See <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/AUTHORS">AUTHORS</a> for more credits.

### License

(c) 2024, Chess.com, LLC
GPLv3 (see <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/Copying.txt">Copying.txt</a>)
