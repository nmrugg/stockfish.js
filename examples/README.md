### Web Examples

To try out the web examples, download this repository and then start the included web server by running

```bash
node server.js
```

Then you can go to `http://localhost:9091/demo.html` to see a simple but working example of how to integrate stockfish.js into the frontend with a board. See `loadEngine.js` and `enginegame.js` to learn more.

You can also view `http://localhost:9091/` for a rudimentary example of how to send commands directly to the engine.

### Node.js Examples

If you want to use stockfish.js from the command line, you may want to simply install it globally: `npm install -g stockfish`. Then you can simply run `stockfish`.

In Node.js, the engines themselves can either be executed directly from the command line or `require()`'d as a CommonJS module.

You can also require this repository directly for a simple engine interface.

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
    }
});

stockfish.processCommand("uci");
stockfish.processCommand("go depth 5");
```

For more detailed examples on how to use stockfish.js from the command line, see `node_abstraction.js`, `node_direct.js`, `node_module.js`, and `node_spawn.js`.

### Download Progress

Thee WASM engine has the ability to report the download progress of the large WASM files. For backwards compatibility, this is not performed automatically.

Download progress can be received by sending a Message Channel Port on an object with the property `progressPort`, like this

```js
var channel = new MessageChannel();
worker.postMessage({progressPort: channel.port2}, [channel.port2]);
```

Messages to that port will be an object with the following properties:
```
{
    percent: <Number>, // The percentage downloaded from 0–1
    loaded: <Number>, // The number of bytes downloaded
    total: <Number>, // The total bytes to download
    speedBytesPerSec: <Number>, // The current download speed in bytes/second
    speedText: <String>, // The download speed as a string in bytes, kilobytes, or megabytes per second (e.g., "278.3 MB/s")
    eta: <Number>, // The amount of time left to complete the download (in seconds)
    etaText: <String>, // The ETA in text form (e.g., "2 sec" or "1 min" rounded to the second or minute)
}
```

Support for download progress can be detected by sending this UCI command `setoption name CanOutputEngineDownloadProgress`. If download progress is available, the engine will respond with `info WillOutputEngineDownloadProgress`.

<a href="/nmrugg/stockfish.js/blob/master/examples/loadEngine.js#L77-L98">See here for an example implementation.</a>

### License

Example code: MIT
