var spawn = require("child_process").spawn;

var stockfish = spawn(require("path").join(__dirname, "stockfishjs"));

stockfish.on("error", function (err)
{
    throw err;
});


stockfish.stdout.on("data", function onstdout(data)
{
    if (typeof data !== "string") {
        data = data.toString();
    }
    //console.log("STDOUT*************")
    process.stdout.write(data)
    if (data.indexOf("uciok") > -1) {
        console.log("**Found uciok**");
        stockfish.stdin.write("ucinewgame\n");
        stockfish.stdin.write("isready\n");
        stockfish.stdin.write("position startpos moves e2e3\n");
        stockfish.stdin.write("eval\n");
        stockfish.stdin.write("d\n");
    }
    
    if (data.indexOf("Legal uci moves") > -1) {
        if (/Legal uci moves\: \S/.test(data)) {
            console.log("**Found valid Legal uci moves**");
            /// Make sure ponder works.
            stockfish.stdin.write("go ponder\n");
            setTimeout(function ()
            {
                stockfish.stdin.write("stop\n");
            }, 100);
        } else {
            throw new Error("Cannot find valid legal uci moves");
        }
    }
    
    if (data.indexOf("bestmove") > -1) {
        console.log("**Found bestmove**");
        stockfish.stdin.write("quit\n");
        //stockfish.stdin.end();
        //process.exit();
    }
});

stockfish.on("exit", function (code)
{
    if (code) {
        throw new Error("Exited with code: " + code);
    }
});


setTimeout(function ()
{
    stockfish.stdin.write("uci\n");
}, 1000);

setTimeout(function ()
{
    throw new Error("Timedout");
}, 1000 * 60 * 5).unref();
