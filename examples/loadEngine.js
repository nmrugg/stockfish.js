var loadEngine = (function ()
{
    "use strict";
    
    var debugging = false;
    
    function spawn_worker(path, options)
    {
        var engine,
            worker = {};
        
        var args = options && options.args || [];
        
        function echo(data)
        {
            var str;
            if (debugging) {
                console.log("echo: ",  data.toString())
            }
            if (worker.onmessage) {
                str = data.toString();
                /// Trim off new lines.
                if (str.slice(-1) === "\n") {
                    str = str.slice(0, -1);
                }
                worker.onmessage(str);
            } else {
                setTimeout(function wait()
                {
                    onstd(data);
                }, 50);
            }
        }
        
        if (path.slice(-3).toLowerCase() === ".js") {
            args.push(path);
            path = process.execPath;
            ///NOTE: Node.js v14+ needs these options.
            ///      At some point in the future, the V8 engine should not need these flags anymore.
            if (process.version.substr(1, 2) >= 14 && process.version.substr(1, 2) < 19) {
                args.unshift("--experimental-wasm-threads");
                args.unshift("--experimental-wasm-simd");
            }
        }
        engine = require("child_process").spawn(path, args, {stdio: "pipe"});
        
        engine.stdout.on("data", echo);
        
        ///NOTE: The "bench" command sends the final result in stderr.
        engine.stderr.on("data", echo);
        
        engine.on("error", function (err)
        {
            throw err;
        });
        
        worker.postMessage = function onin(str)
        {
            if (debugging) {
                console.log("stdin: " + str)
            }
            engine.stdin.write(str + "\n");
        };
        
        worker.terminate = function ()
        {
            engine.kill();
        };
        
        return worker;
    }
    
    function new_worker(path, options)
    {
        /// Is this Node.js?
        if (typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]") {
            return spawn_worker(path || require("path").join(__dirname, "src", "stockfish.js"), options);
        }
        
        path = path || "stockfish.js";
        
        if (typeof Worker === "function") {
            return new Worker(path);
        }
    }
    
    function get_first_word(line)
    {
        var space_index = line.indexOf(" ");
        
        /// If there are no spaces, send the whole line.
        if (space_index === -1) {
            return line;
        }
        return line.substr(0, space_index);
    }
    
    return function loadEngine(path, options)
    {
        var worker = new_worker(path, options),
            engine = {started: Date.now()},
            que = [],
            eval_regex = /Total Evaluation[\s\S]+\n$/;
        
        function determine_que_num(line, que)
        {
            var cmd_type,
                first_word = get_first_word(line),
                cmd_first_word,
                i,
                len;
            
            /// bench and perft are blocking commands.
            if (que[0].cmd !== "bench" && que[0].cmd !== "perft") {
                if (first_word === "uciok" || first_word === "option") {
                    cmd_type = "uci";
                } else if (first_word === "readyok") {
                    cmd_type = "isready";
                } else if (first_word === "bestmove" || first_word === "info") {
                    cmd_type = "go";
                } else {
                    /// eval and d are more difficult.
                    cmd_type = "other";
                }
                
                len = que.length;
                
                for (i = 0; i < len; i += 1) {
                    cmd_first_word = get_first_word(que[i].cmd);
                    if (cmd_first_word === cmd_type || (cmd_type === "other" && (cmd_first_word === "d" || cmd_first_word === "eval"))) {
                        return i;
                    }
                }
            }
            
            /// Not sure; just go with the first one.
            return 0;
        }
        
        worker.onmessage = function onmessage(e)
        {
            var line = typeof e === "string" ? e : e.data,
                done,
                que_num = 0,
                my_que,
                split,
                i;
            
            /// If it's got more than one line in it, break it up.
            if (line.indexOf("\n") > -1) {
                split = line.split("\n");
                for (i = 0; i < split.length; i += 1) {
                    onmessage(split[i]);
                }
                return;
            }
            
            if (debugging) {
                console.log("debug (onmessage): " + line)
            }
            
            /// Stream everything to this, even invalid lines.
            if (engine.stream) {
                engine.stream(line);
            }
            
            /// Ignore invalid setoption commands since valid ones do not repond.
            /// Ignore the beginning output too.
            if (!que.length || line.substr(0, 14) === "No such option" || line.substr(0, 3) === "id " || line.substr(0, 9) === "Stockfish") {
                return;
            }
            
            que_num = determine_que_num(line, que);
            
            my_que = que[que_num];
            
            if (!my_que) {
                return;
            }
            
            if (my_que.stream) {
                my_que.stream(line);
            }
            
            if (typeof my_que.message === "undefined") {
                my_que.message = "";
            } else if (my_que.message !== "") {
                my_que.message += "\n";
            }
            
            my_que.message += line;
            
            /// Try to determine if the stream is done.
            if (line === "uciok") {
                /// uci
                done = true;
                engine.loaded = true;
            } else if (line === "readyok") {
                /// isready
                done = true;
                engine.ready = true;
            } else if (line.substr(0, 8) === "bestmove" && my_que.cmd !== "bench") {
                /// go [...]
                done = true;
                /// All "go" needs is the last line (use stream to get more)
                my_que.message = line;
            } else if (my_que.cmd === "d") {
                if (line.substr(0, 15) === "Legal uci moves" || line.substr(0, 6) === "Key is") {
                    my_que.done = true;
                    done = true;
                    /// If this is the hack, delete it.
                    if (line === "Key is") {
                        my_que.message = my_que.message.slice(0, -7);
                    }
                }
            } else if (my_que.cmd === "eval") {
                if (eval_regex.test(my_que.message)) {
                    done = true;
                }
            } else if (line.substr(0, 8) === "pawn key") { /// "key"
                done = true;
            } else if (line.substr(0, 12) === "Nodes/second") { /// "bench" or "perft"
                /// You could just return the last three lines, but I don't want to add more code to this file than is necessary.
                done = true;
            } else if (line.substr(0, 15) === "Unknown command") {
                done = true;
            }
            
            if (done) {
                /// Remove this from the que.
                que.splice(que_num, 1);
                
                if (my_que.cb && !my_que.discard) {
                    my_que.cb(my_que.message);
                }
            }
        };
        
        engine.send = function send(cmd, cb, stream)
        {
            var no_reply;
            
            cmd = String(cmd).trim();
            
            if (debugging) {
                console.log("debug (send): " + cmd);
            }
            
            /// Only add a que for commands that always print.
            ///NOTE: setoption may or may not print a statement.
            if (cmd !== "ucinewgame" && cmd !== "flip" && cmd !== "stop" && cmd !== "ponderhit" && cmd.substr(0, 8) !== "position"  && cmd.substr(0, 9) !== "setoption" && cmd !== "stop") {
                que[que.length] = {
                    cmd: cmd,
                    cb: cb,
                    stream: stream
                };
            } else {
                no_reply = true;
            }
            
            worker.postMessage(cmd);
            
            if (no_reply && cb) {
                setTimeout(cb, 0);
            }
        };
        
        engine.stop_moves = function stop_moves()
        {
            var i,
                len = que.length;
            
            for (i = 0; i < len; i += 1) {
                if (debugging) {
                    console.log("debug (stop_moves): " + i, get_first_word(que[i].cmd))
                }
                /// We found a move that has not been stopped yet.
                if (get_first_word(que[i].cmd) === "go" && !que[i].discard) {
                    engine.send("stop");
                    que[i].discard = true;
                }
            }
        };
        
        engine.get_cue_len = function get_cue_len()
        {
            return que.length;
        };
        
        engine.quit = function ()
        {
            if (worker && worker.terminate) {
                worker.terminate();
                worker = null;
                engine.ready = undefined;
            }
        };
        
        return engine;
    };
}());

if (typeof module !== "undefined" && module.exports) {
    module.exports = loadEngine;
}
