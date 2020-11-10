var body = document.documentElement;
var params = get_params();
var stockfish;
var times = 0;
var moves = [];
var startingFen = params.fen;
var movesToPlay = Number(params.movesToPlay) || 3;
var depth = Number(params.depth) || 15;
var delay = Number(params.delay) || 500;
var fen;

/// See console
load_engine.log = 1;

function get_params()
{
    var sep1 = location.search.split(/\&|\?/g),
        sep2,
        params = {},
        i,
        len;
    
    len = sep1.length;
    
    if (len > 1) {
        ///NOTE: Skip the first empty element (it's empty because URL's start with a slash).
        for (i = 1; i < len; i += 1) {
            sep2 = sep1[i].split(/=/);
            sep2[0] = decodeURIComponent(sep2[0]);
            if (sep2[1]) {
                sep2[1] = decodeURIComponent(sep2[1]);
            }
            if (typeof params[sep2[0]] === "undefined") {
                params[sep2[0]] = sep2[1];
            } else {
                if (typeof params[sep2[0]] !== "object") {
                    params[sep2[0]] = [params[sep2[0]]];
                }
                params[sep2[0]].push(sep2[1]);
            }
        }
    }
    
    return params;
};


function loadEngine(engineOptions, cb)
{
    if (!stockfish) {
        stockfish = load_engine(engineOptions.enginePath, engineOptions.pathToWasmEngine, cb);
    } else {
        setTimeout(cb, 0);
    }
}

function runEngine(name, engineOptions, cmd, cb)
{
    loadEngine(engineOptions, function onready()
    {
        body.innerHTML += "<div><b>" + name + " at " + (fen ? fen : startingFen || "the starting position") + "</b></div>";
        window.scrollTo(window.scrollX, 99e9);
        setTimeout(function ()
        {
            var fenPos = startingFen ? "fen " + startingFen : "startpos";
            
            if (moves.length) {
                stockfish.send("position " + fenPos + " moves " + moves.join(" "));
            } else {
                stockfish.send("position " + fenPos);
            }
            
            stockfish.send(cmd, function onget(data)
            {
                var bestMove = data.match(/bestmove (\S+)/)[1];
                console.log(data);
                body.innerHTML += "<div><b>Best move is " + bestMove + "</b></div>";
                window.scrollTo(window.scrollX, 99e9);
                
                moves.push(bestMove);
                
                stockfish.send("position " + fenPos + " moves " + moves.join(" "));
                
                stockfish.send("d", function (data)
                {
                    fen = data.match(/Fen: (.+)/i)[1];
                    
                    body.innerHTML += "<div><pre>" + data +"</pre></div>";
                    window.scrollTo(window.scrollX, 99e9);
                    
                    if (cb) {
                        cb();
                    }
                });
            }, function streamer(data)
            {
                body.innerHTML += "<div>" + data + "</div>";
                window.scrollTo(window.scrollX, 99e9);
            });
        }, delay / 2);
    });
}

function run()
{
    runEngine("Stockfish WASM", {
        enginePath: "./stockfish.js",
        pathToWasmEngine: "./stockfish.wasm",
    },  "go depth " + depth, function ondone()
    {
        if (++times < movesToPlay) {
            setTimeout(run, delay);
        } else {
            stockfish.quit();
            stockfish = undefined;
        }
    });
}

run();
