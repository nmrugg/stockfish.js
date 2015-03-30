### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a pure JavaScript implamentation of <a href="https://github.com/mcostalba/Stockfish">Stockfish</a>.

It currently runs Stockfish 6.

Stockfish.js is an emscripten port of the Stockfish chess engine.

### API

You can run Stockfish.js directly from the command line with `node.js`.

In a web browser, Stockfish.js can be run in a web-worker, which can be created
like this:

    var stockfish = new Worker("stockfish.js");

If you don't want to use Web Workers, simply add a script tag, like this:

    <script src="stockfish.js"></script>

Then you can create a new instance by calling the `STOCKFISH()` function.

    var stockfish = STOCKFISH();

Input (standard UCI commands) to the engine is posted as a message to the worker:

    engine.postMessage("go depth 15");

The output of the engine is again posted as a message, to receive it
you need to install an event handler:

    engine.onmessage = function(event) {
        //NOTE: Web Workers wrap the reponse in an object.
        console.log(event.data ? event.data : event);
    };

In Node.js, you can either run it directly (`node stockfish.js`) or require. it (`require("./stockfish.js")`)

### Note about pondering

The code has been slightly refactored to allow for pondering.
However, it can take a long time for Stockfish.js to receive the "stop" or "ponderhit" commands.
So it could be dangerous to use in a timed game.

In the future, it may be improved.

### Compiling

You need to have the emscripten compiler installed and in your path.
Then you can compile Stockfish.js like this:

    ./build.sh

### Example

You can try out Stockfish.js online <a href="https://nmrugg.github.io/kingdom/">here</a>.

There are also examples in the example folder. You can open the file directly or run a small static server to try it out.
If you have node.js, you can start a simple webserver in that directory
like this:

    node server.js

There is also a simple example using Node.js.

Alternatively, you can also run Stockfish.js from the command line via `./stockfish.js` or `node src/stockfish.js`.
