
///NOTE: Without the new line above, it may be joined to a line comment above.

/// Make Stockfish use setImmediate() (rather than setTimeout() or requestAnimationFrame()) if possible.
///
/// Based on setImmediate polyfill: https://github.com/YuzuJS/setImmediate
/// Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola
/// MIT
var ourSetImmediate = (function (global, undefined)
{
    "use strict";

    if (global.setImmediate) {
        try {
            return global.setImmediate.bind(global);
        } catch (e) {
            return global.setImmediate;
        }
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    return setImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

///NOTE: Emscripten does not use cancelAnimationFrame() or clearTimeout().
Browser.requestAnimationFrame = ourSetImmediate;

return Module;
} /// End of load_stockfish() from pre.js


/// This is returned to STOCKFISH() in pre.js.
return function (WasmPath)
{
    var myConsole,
        Module,
        workerObj,
        cmds = [],
        loaded,
        wait = typeof setImmediate === "function" ? setImmediate : setTimeout;
    
    myConsole = {
        log: function log(line)
        {
            if (workerObj.onmessage) {
                /// Match Web Workers.
                workerObj.onmessage(line)
            } else {
                console.error("You must set onmessage");
                console.info(line);
            }
        },
        time: function time(s)
        {
            if (typeof console !== "undefined" && console.time) console.time(s);
        },
        timeEnd: function timeEnd(s)
        {
            if (typeof console !== "undefined" && console.timeEnd) console.timeEnd(s);
        }
    };
    
    myConsole.warn = myConsole.log;
    
    workerObj = {
        postMessage: function sendMessage(str, sync)
        {
            function ccall()
            {
                if (loaded) {
                    Module.ccall("uci_command", "number", ["string"], [cmds.shift()]);
                } else {
                    setTimeout(ccall, 20);
                }
            }
            
            cmds.push(str);
            
            if (sync) {
                ccall();
            } else {
                wait(ccall, 1);
            }
        }
    };
    
    /// We need to give them a chance to set postMessage
    wait(function ()
    {
        Module = load_stockfish(myConsole, WasmPath);
        
        Module.onRuntimeInitialized = function ()
        {
            loaded = true;
        };
        
        if (Module.print) {
            Module.print = myConsole.log;
        }
        if (Module.printErr) {
            Module.printErr = myConsole.log;
        }
    }, 1);
    
    return workerObj;
};

}()); /// End of STOCKFISH() closeure from pre.js.


(function ()
{
    var isNode,
        stockfish;
    
    function completer(line)
    {
        var completions = [
            "d",
            "eval",
            "exit",
            "flip",
            "go",
            "isready",
            "ponderhit",
            "position fen ",
            "position startpos",
            "position startpos moves",
            "quit",
            "setoption name Clear Hash value ",
            "setoption name Contempt value ",
            "setoption name Hash value ",
            "setoption name Minimum Thinking Time value ",
            "setoption name Move Overhead value ",
            "setoption name MultiPV value ",
            "setoption name Ponder value ",
            "setoption name Skill Level Maximum Error value ",
            "setoption name Skill Level Probability value ",
            "setoption name Skill Level value ",
            "setoption name Slow Mover value ",
            "setoption name Threads value ",
            "setoption name UCI_Chess960 value false",
            "setoption name UCI_Chess960 value true",
            "setoption name UCI_Variant value chess",
            "setoption name UCI_Variant value atomic",
            "setoption name UCI_Variant value crazyhouse",
            "setoption name UCI_Variant value giveaway",
            "setoption name UCI_Variant value horde",
            "setoption name UCI_Variant value kingofthehill",
            "setoption name UCI_Variant value racingkings",
            "setoption name UCI_Variant value relay",
            "setoption name UCI_Variant value threecheck",
            "setoption name nodestime value ",
            "stop",
            "uci",
            "ucinewgame"
        ];
        var completionsMid = [
            "binc ",
            "btime ",
            "confidence ",
            "depth ",
            "infinite ",
            "mate ",
            "maxdepth ",
            "maxtime ",
            "mindepth ",
            "mintime ",
            "moves ", /// for position fen ... moves
            "movestogo ",
            "movetime ",
            "ponder ",
            "searchmoves ",
            "shallow ",
            "winc ",
            "wtime "
        ];
        
        function filter(c)
        {
            return c.indexOf(line) === 0;
        }
        
        /// This looks for completions starting at the very beginning of the line.
        /// If the user has typed nothing, it will match everything.
        var hits = completions.filter(filter);
        
        if (!hits.length) {
            /// Just get the last word.
            line = line.replace(/^.*\s/, "");
            if (line) {
                /// Find completion mid line too.
                hits = completionsMid.filter(filter);
            } else {
                /// If no word has been typed, show all options.
                hits = completionsMid;
            }
        }
        
        return [hits, line];
    }   
    
    isNode = typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
    
    if (isNode) {
        /// Was it called directly?
        if (require.main === module) {
            stockfish = STOCKFISH(require("path").join(__dirname, "stockfish.wasm"));
            
            stockfish.onmessage = function onlog(line)
            {
                console.log(line);
            };
            
            require("readline").createInterface({
                input: process.stdin,
                output: process.stdout,
                completer: completer,
                historySize: 100,
            }).on("line", function online(line)
            {
                if (line) {
                    if (line === "quit" || line === "exit") {
                        process.exit();
                    }
                    stockfish.postMessage(line, true);
                }
            }).setPrompt("");
            
            process.stdin.on("end", function onend()
            {
                process.exit();
            });
        /// Is this a node module?
        } else {
            module.exports = STOCKFISH;
        }
        
    /// Is it a web worker?
    } else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined")) {
        if (self && self.location && self.location.hash) {
            /// Use .substr() to trim off the hash (#).
            stockfish = STOCKFISH(self.location.hash.substr(1));
        } else {
            stockfish = STOCKFISH();
        }
        
        onmessage = function(event) {
            stockfish.postMessage(event.data, true);
        };
        
        stockfish.onmessage = function onlog(line)
        {
            postMessage(line);
        };
    }
    ///NOTE: If it's a normal browser, we don't need to do anything. The client can use the STOCKFISH() function directly.
}());
