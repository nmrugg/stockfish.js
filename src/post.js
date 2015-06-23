
///NOTE: Without the new line above, it may be joined to a line comment above.
return Module;
} /// End of load_stockfish()

    
return function ()
{
    var my_console,
        Module,
        return_val,
        cmds = [],
        wait = typeof setImmediate === "function" ? setImmediate : setTimeout;
    
    my_console = {
        log: function log(line)
        {
            if (return_val.onmessage) {
                /// Match Web Workers.
                return_val.onmessage(line)
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
    
    return_val = {
        postMessage: function send_message(str, sync)
        {
            function ccall()
            {
                if (Module) {
                    Module.ccall("uci_command", "number", ["string"], [cmds.shift()]);
                } else {
                    setTimeout(ccall, 100);
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
        Module = load_stockfish(my_console);
        
        if (Module.print) {
            Module.print = my_console.log;
        }
        if (Module.printErr) {
            Module.printErr = my_console.log;
        }
        
        /// Initialize.
        Module.ccall("init", "number", [], []);
    }, 1);
    
    return return_val;
};

}());


(function ()
{
    var is_node,
        stockfish;
    
    try {
        is_node = Object.prototype.toString.call(global.process) === "[object process]";
    } catch(e) {}
    
    if (is_node) {
        /// Was it called directly?
        if (require.main === module) {
            stockfish = STOCKFISH();
            
            stockfish.onmessage = function onlog(line)
            {
                console.log(line);
            };
            
            require("readline").createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false
            }).on("line", function online(line)
            {
                if (line) {
                    if (line == "quit") {
                        process.exit();
                    }
                    stockfish.postMessage(line, true);
                }
            });
            
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
        stockfish = STOCKFISH();
        
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
