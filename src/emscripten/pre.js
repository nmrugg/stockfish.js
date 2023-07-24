/// XMLHttpRequest polyfill for Node.js.
if (typeof XMLHttpRequest === "undefined") {
    global["XMLHttpRequest"] = function (a)
    {
        var url
        var xhr = {
            open: function (method, _url)
            {
                url = _url;
            },
            send: function ()
            {
                require("fs").readFile(url, function (err, data)
                {
                    xhr.readyState = 4; /// DONE
                    if (err) {
                        console.error(err);
                        xhr.status = 404;
                        xhr.onerror(err);
                    } else {
                        xhr.status = 200;
                        xhr.response = data;
                        xhr.onreadystatechange();
                        xhr.onload();
                    }
                });
            }
        };
        return xhr;
    }
}

if (typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && typeof fetch !== "undefined") {
    fetch = null;
}

//
// Post custom message to all workers (including main worker)
//
Module["postCustomMessage"] = function (data)
{
    if (typeof PThread !== "undefined") {
        // TODO: Acutally want to post only to main worker
        for (var worker of PThread.runningWorkers) {
        worker.postMessage({"cmd": "custom", "userData": data});
        }
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

Module["onCustomMessage"] = function (data)
{
    if (!queuePaused) {
        Module["queue"].put(data);
    } else {
        waitingQueue.push(data);
    }
};

var queuePaused;
var waitingQueue = [];
Module["pauseQueue"] = function ()
{
    queuePaused = true;
}
Module["unpauseQueue"] = function ()
{
    var oldQueue = waitingQueue;
    waitingQueue = [];
    queuePaused = false;
    oldQueue.forEach(function (data)
    {
        Module["queue"].put(data);
    });
}
//
// API
//

// Align to the same API as niklasf's stockfish
Module["postMessage"] = Module["postCustomMessage"];

var listeners = [];

Module["addMessageListener"] = function (listener)
{
    listeners.push(listener);
};

Module["removeMessageListener"] = function (listener)
{
    var i = listeners.indexOf(listener);
    if (i >= 0) {
        listeners.splice(i, 1);
    }
};

Module["print"] = Module["printErr"] = function (data)
{
    if (listeners.length === 0) {
        return console.log(data);
    }
    for (var listener of listeners) {
        listener(data);
    }
};

Module["terminate"] = function ()
{
    if (typeof PThread !== "undefined") {
        PThread.terminateAllThreads();
    }
};
