### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a WASM implementation of <a href="https://github.com/official-stockfish/Stockfish">Stockfish</a> chess engine.

Stockfish.js is currently updated to Stockfish 15.

```
NOTE: Stockfish.js 15 reqiures some of the latest features and does not work in every browser.
```

This is a multi-threaded engine, and will only run in newer browsers and node.js versions. For an older JS and WASM version, see the <a href=../../tree/Stockfish11>Stockfish.js 11 branch</a>.

### API

You can run Stockfish.js directly from the command line with Node.js 14.4+. You may need to add some command line flags to get it to run:

```shell
node --experimental-wasm-threads --experimental-wasm-simd stockfish.js
```
Stockfish.js can be found in the npm repository and installed like this: `npm install stockfish`.

If you want to use it from the command line, you may want to simply install it globally: `npm install -g stockfish`. Then you can simply run `stockfishjs`.

In Node.js, you can either run it directly from the command line (i.e., `node src/stockfish.js`) or require() it as a module (i.e., `var stockfish = require("stockfish");`).

### Compiling

You need to have the <a href="http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html">emscripten</a> compiler installed and in your path (tested with `2.0.26`). Then you can compile Stockfish.js with the build script: `./build.js`. See `./build.js --help` for details.

### Example

There are examples in the example folder. You will need to run the example/server.js server to veiw the client-side examples.

There are also example using Node.js.

### Thanks

- <a href="https://github.com/mcostalba/Stockfish">The Stockfish team</a>
- <a href="https://github.com/exoticorn/stockfish-js">exoticorn</a>
- <a href="https://github.com/ddugovic/Stockfish">ddugovic</a>
- <a href="https://github.com/niklasf/">niklasf</a> <a href="https://github.com/niklasf/stockfish.js">stockfish.js</a> & <a href="https://github.com/niklasf/stockfish.wasm">stockfish.wasm</a>
- <a href="https://github.com/hi-ogawa/Stockfish">hi-ogawa</a> (faster WASM NNUE evaluation)

### License

GPLv3 (see <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/license.txt">license.txt</a>)
