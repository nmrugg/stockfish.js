# Examples

## Web examples

Clone this repository, then start the included web server:

```bash
node examples/server.js
```

On the first run, `get-engine.js` installs the current [`stockfish`](https://www.npmjs.com/package/stockfish) package into `examples/node_modules`.

Then you can go to `http://localhost:9091/demo.html` to see a simple but working example of how to integrate stockfish.js into the frontend with a board, clocks, skill levels, and an evaluation readout. See `enginegame.js` and `loadEngine.js` to learn more.

By default, `demo.html` loads `node_modules/stockfish/bin/stockfish.js`, which points at the full multi-threaded engine (about 94MB). To use a smaller engine, pass `stockfishjs` to `engineGame()` in the inline script at the bottom of `demo.html`:

```js
var game = engineGame({stockfishjs: "src/stockfish-19-lite-single.js"});
```

You can also view `http://localhost:9091/` for a rudimentary example of how to send commands directly to the engine. See `index.html`.

To load a particular engine in the plain console, use the `engine` query parameter (and, if you need it, `engineWasm`):

```
http://localhost:9091/?engine=/src/stockfish-19-lite-single.js
```

### Demo server options

Run `node server.js --help` for the full list.

| Option | Description |
| --- | --- |
| `-p`, `--port` | Port to listen to (default `9091`, or `443` with `--ssl`) |
| `--cors` | Send the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers that the multi-threaded engines need |
| `--coop` | Send only the `Cross-Origin-Opener-Policy` header |
| `--coep` | Send only the `Cross-Origin-Embedder-Policy` header |
| `--dir=DIR` | Which directory to serve files from (default: the `examples` directory) |
| `--list` | List directory contents instead of returning 404 |
| `--ssl` | Serve over HTTPS with a randomly generated self-signed key |
| `--throttle=KBPS` | Limit responses to a maximum of kilobytes per second. Useful for testing download progress reporting |
| `-h`, `--help` | Print the help |

The demo server always sends the CORS headers, so the multi-threaded engines work out of the box. If you serve the files with a different web server, you will need to add those headers yourself to run them. See [the cross-origin isolation guide](https://web.dev/articles/cross-origin-isolation-guide).

## Node.js examples

If you want to use stockfish.js from the command line, you may want to simply install it globally: `npm install -g stockfish`. Then you can simply run `stockfish`.

In Node.js, the engines themselves can either be executed directly from the command line (they read UCI commands from stdin and write to stdout) or `require()`'d as a CommonJS module.

The simplest interface is the npm package, which is a small wrapper around the engine.

First run:

```bash
npm init -y
npm install stockfish
```

Then create a script, like `run-stockfish.js`:

```js
var stockfish = require("stockfish")("lite-single", function onMessage(line) {
    console.log("STDOUT:", line);
    if (/bestmove \S+/.test(line)) {
        console.log("The best move is " + line.match(/bestmove (\S+)/)[1] + ".");
        stockfish.terminate();
    }
});

stockfish.processCommand("uci");
stockfish.processCommand("go depth 5");
```

The first argument selects the engine. It can be a keyword (`"full"`, `"lite"`, `"single"`, `"lite-single"`, `"asm"`) or a path to any stockfish.js engine file. If you leave it out, the full engine is used. Call `terminate()` when you are done so that the process exits.

The second argument is a function that will be called every time the engine emits a line. If no function is provided, it will log to the console.

### The example scripts

The `node_*.js` scripts are all runnable. Each one calls `get-engine.js` first, so the engine files are downloaded the first time you run one of them. All of them except `node_direct.js` take an optional engine keyword as their first argument, for example `node node_module.js lite-single`.

| File | What it demonstrates |
| --- | --- |
| `node_module.js` | The shortest path: `require("stockfish")(type, onMessage)` |
| `node_direct.js` | A fuller script built on the same interface: `eval`, `d`, MultiPV, and pondering. Takes a FEN or a list of moves on the command line instead of an engine keyword |
| `node_abstraction.js` | The `loadEngine.js` abstraction: command queueing, streaming `info` lines, `stop`, and quitting |
| `node_spawn.js` | The lowest level: spawn the engine with `child_process`, listen to stdout, write to stdin |
| `loadEngine.js` | The abstraction layer itself, used by `index.html` and `node_abstraction.js` |
| `enginegame.js` | The board and game logic used by `demo.html` |

`node_abstraction.js` and `node_spawn.js` work with any UCI compatible engine, including native binaries.

Node.js 14 through 18 need `--experimental-wasm-threads --experimental-wasm-simd` to run the multi-threaded engines. `loadEngine.js` adds those flags automatically.

## Download progress

The WASM engine has the ability to report the download progress of the large WASM files. This is supported by the npm package version 18.0.8 and newer. For backwards compatibility, it is not performed automatically.

Download progress can be received by sending a Message Channel Port on an object with the property `progressPort`, like this

```js
var channel = new MessageChannel();
worker.postMessage({progressPort: channel.port2}, [channel.port2]);
```

Messages to that port will be an object with the following properties:

```
{
    percent: <Number>, // The percentage downloaded, from 0 to 1
    loaded: <Number>, // The number of bytes downloaded
    total: <Number>, // The total bytes to download
    speedBytesPerSec: <Number>, // The current download speed in bytes/second
    speedText: <String>, // The download speed as a string in bytes, kilobytes, or megabytes per second (e.g., "278.3 MB/s")
    eta: <Number>, // The amount of time left to complete the download (in seconds)
    etaText: <String>, // The ETA in text form (e.g., "2 sec" or "1 min" rounded to the second or minute)
}
```

Support for download progress can be detected by sending this UCI command `setoption name CanOutputEngineDownloadProgress`. If download progress is available, the engine will respond with `info WillOutputEngineDownloadProgress`.

The `loadEngine.js` abstraction does all of this for you when you pass an `onProgress` callback:

```js
loadEngine("stockfish.js", {onProgress: function (data) {
    console.log(data.percent, data.speedText, data.etaText);
}}, function onReady(engine) {
    engine.send("go depth 10", console.log);
});
```

The `--throttle` option of the demo server makes this easy to see locally: run `node server.js --throttle=10240`, then open `demo.html`. (You may need to check `Disable cache` in DevTools to see the difference.)

<a href="/nmrugg/stockfish.js/blob/master/examples/loadEngine.js#L77-L98">See here for an example implementation.</a>

## License

Example code: MIT
