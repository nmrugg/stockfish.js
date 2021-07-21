
(function () {
    /// Message listeners
    var listeners = [];
    /// Command queue
    var queue = [];
    
    /// Fix setting _scriptDir in a Web Worker.
    if (typeof importScripts === "function") {
        _scriptDir = self.location.origin + self.location.pathname;
    }
    
    /// Created in preface.js
    Module.wasmBinaryFile = wasmPath;
    
    Module.print = function (line)
    {
        if (listeners.length === 0) {
            console.log(line);
        } else {
            for (var i in listeners) {
                listeners[i](line);
            }
        }
    };

    Module.addMessageListener = function (listener)
    {
        listeners.push(listener);
    };

    Module.removeMessageListener = function (listener)
    {
        var idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
    };

    function poll()
    {
        var command = queue.shift();
        
        if (!command) {
            return;
        }
        
        /// If it returns true, it is not ready yet.
        if (Module.ccall("uci_command", "number", ["string"], [command])) {
            queue.unshift(command);
        }
        
        if (queue.length) {
            setTimeout(poll, 10);
        }
    }

    Module.postMessage = function (command)
    {
        queue.push(command);
    };

    Module.postRun = function()
    {
        Module.postMessage = function (command)
        {
            queue.push(command);
            if (queue.length === 1) {
                poll();
            }
        };

        poll();
    };
})();
