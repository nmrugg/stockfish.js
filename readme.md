### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a pure JavaScript implementation of <a href="https://github.com/official-stockfish/Stockfish">Stockfish</a>, the world's strongest chess engine.

Stockfish.js is currently synced with Stockfish 10.

### API

You can run Stockfish.js directly from the command line with Node.js.

In a web browser, Stockfish.js can be run in a web-worker, which can be created like this:

```js
var stockfish = new Worker("stockfish.js");
```

The output of the engine is again posted as a message. To receive it, you need to add a message handler:

```js
stockfish.onmessage = function onmessage(event) {
    console.log(event.data);
};
```

Input (standard UCI commands) to the engine is posted as a message to the worker:

```js
stockfish.postMessage("go depth 15");
```

Stockfish.js can be found in the npm repository and installed like this: `npm install stockfish`.

If you want to use it from the command line, you may want to simply install it globally: `npm install -g stockfish`. Then you can simply run `stockfishjs`.

In Node.js, you can either run it directly from the command line (i.e., `node src/stockfish.js`) or require() it as a module (i.e., `var stockfish = require("stockfish");`).

### Note about pondering

The code has been refactored to allow for pondering. However, it can take a long time for Stockfish.js to process the "stop" or "ponderhit" commands. So it could be dangerous to use in a timed game.

In the future, it may be improved upon.

### Compiling

You need to have the <a href="http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html">emscripten</a> compiler installed and in your path. Then you can compile Stockfish.js with the build script: `./build.js`. See `./build.js --help` for details.

### Example

You can try out Stockfish.js online <a href="https://nmrugg.github.io/kingdom/">here</a>.

There are also examples in the example folder. You can either open the example/index.html directly in a web browser or run a small static server to try it out.
If you have Node.js, you can start a simple web server in that directory
like this: `node server.js`.

There is also a simple example using Node.js (example/simple_node.js).

Alternatively, you can also run Stockfish.js from the command line via `./stockfish.js` or `node src/stockfish.js`.

### Thanks

- <a href="https://github.com/mcostalba/Stockfish">The Stockfish team</a>
- <a href="https://github.com/exoticorn/stockfish-js">exoticorn</a>
- <a href="https://github.com/ddugovic/Stockfish">ddugovic</a>
- <a href="https://github.com/niklasf/stockfish.js">niklasf</a>

### License

GPLv3 (see <a href="https://raw.githubusercontent.com/nmrugg/stockfish.js/master/license.txt">license.txt</a>)
