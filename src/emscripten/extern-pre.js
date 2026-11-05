(function () {
function createUciQueue(sendCommand, asyncGo)
{
    var queue = [];
    var busy = false;
    var draining = false;
    var closed = false;

    function commandName(cmd)
    {
        return cmd.split(/\s+/, 1)[0];
    }

    function onDone()
    {
        busy = false;
        drain();
    }

    function drain()
    {
        if (draining || closed) {
            return;
        }
        draining = true;
        try {
            while (queue.length) {
                var name = commandName(queue[0]);
                // Readiness queries may pass a running search, but not earlier
                // queued changes such as setoption or position.
                if (busy && name !== "isready" && name !== "uci") {
                    break;
                }
                var cmd = queue.shift();
                if (name === "go") {
                    // In pthread builds ccall only enqueues the command, so
                    // _isSearching() may not reflect it yet.
                    busy = true;
                    var result = sendCommand(cmd);
                    if (asyncGo) {
                        // Wait for Asyncify to restore the stack, not the
                        // earlier C++ completion notification.
                        Promise.resolve(result).then(onDone, function (error)
                        {
                            closed = true;
                            queue = [];
                            setTimeout(function () { throw error; }, 0);
                        });
                    }
                } else {
                    sendCommand(cmd);
                }
            }
        } catch (error) {
            closed = true;
            queue = [];
            throw error;
        } finally {
            draining = false;
        }
    }

    function processCommand(cmd)
    {
        cmd = cmd.trim();
        if (!cmd || closed) {
            return;
        }
        var name = commandName(cmd);
        if (name === "quit") {
            closed = true;
            queue = [];
            sendCommand("quit");
        } else if (name === "stop" || name === "ponderhit") {
            // These control the active search; they must not wait behind it.
            sendCommand(cmd);
        } else {
            queue.push(cmd);
            drain();
        }
    }

    return {
        processCommand: processCommand,
        onSearchDone: function ()
        {
            if (!asyncGo) {
                onDone();
            }
        }
    };
}
