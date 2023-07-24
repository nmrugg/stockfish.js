;console.log("This is not used, right?");
//
// Post custom message to all workers (including main worker)
//
Module["postCustomMessage"] = (data) => {
  // TODO: Acutally want to post only to main worker
  for (let worker of PThread.runningWorkers) {
    worker.postMessage({ 'cmd': 'custom', 'userData': data });
  }
};

//
// Simple queue with async get (assume single consumer)
//
function createQueue()
{
    var list = [];
    var queue = {};
    var pending;
    return {
        get: async function ()
        {
            if (list.length > 0) {
                return list.shift();
            }
            return await new Promise(function (resolve)
            {
                return pending = resolve;
            });
        },
        put: function (data)
        {
            if (pending) {
                pending(data);
                pending = null;
            } else {
                list.push(data);
            }
        }
    };
}
//
// TODO: This is used only by main worker
//
Module["queue"] = createQueue();

Module["onCustomMessage"] = (data) => {
  Module["queue"].put(data);
};

//
// API
//

// Align to the same API as niklasf's stockfish
Module["postMessage"] = Module["postCustomMessage"];

const listeners = [];

Module["addMessageListener"] = (listener) => {
  listeners.push(listener);
};

Module["removeMessageListener"] = (listener) => {
  const i = listeners.indexOf(listener);
  if (i >= 0) { listeners.splice(i, 1); }
};

Module["print"] = Module["printErr"] = (data) => {
  if (listeners.length === 0) { console.log(data); return; }
  for (let listener of listeners) {
    listener(data);
  }
};

Module["terminate"] = () => {
  PThread.terminateAllThreads();
};

//
// Small wrapper to load NNUE weights from buffer (e.g. ArrayBuffer or NodeJS's Buffer)
//
// Usage in node:
//   $ node --experimental-wasm-{simd,threads} --experimental-repl-await
//   let stockfish = await require("./src/emscripten/public/stockfish.js")();
//   let data = await fs.promises.readFile("src/nn-76a8a7ffb820.nnue");
//   let cleanup = stockfish.setEvalFile(data, "/nn-76a8a7ffb820.nnue");
//   stockfish.postMessage("eval");
//   cleanup();
//
/*
Module["setEvalFile"] = (buffer, filename) => {
  const file = FS.open(filename, "w");
  FS.write(file, buffer, 0, buffer.length);
  Module["postMessage"](`setoption name EvalFile value ${filename}`);
  FS.close(file);
  // Returns callback to cleanup resource after it's verified that data are loaded correctly e.g. by "eval" command.
  return () => FS.unlink(filename);
};
*/