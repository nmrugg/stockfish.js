var spawn = require("child_process").spawn;
var found_san_moves;

var stockfish = spawn(require("path").join(__dirname, "stockfishjs"));


function good(mixed)
{
    console.log("\u001B[32m" + mixed + "\u001B[0m");
}

function warn(mixed)
{
    console.warn("\u001B[33m" + mixed + "\u001B[0m");
}

function error(mixed)
{
    console.error("\u001B[31m" + mixed + "\u001B[0m");
}


function write(str)
{
    warn("STDIN: " + str);
    stockfish.stdin.write(str + "\n");
}

stockfish.on("error", function (err)
{
    throw err;
});

stockfish.stdout.on("data", function onstdout(data)
{
    if (typeof data !== "string") {
        data = data.toString();
    }
    
    process.stdout.write(data)
    if (data.indexOf("uciok") > -1) {
        good("**Found uciok**");
        write("ucinewgame");
        write("isready");
        write("position startpos moves e2e3");
        write("eval");
        write("d");
    }
    
    if (data.indexOf("Legal moves") > -1) {
        if (/Legal moves\: [a-hBKNQRO0]/.test(data)) {
            good("**Found valid legal san moves**");
            found_san_moves = true;
        }
    }
    
    if (data.indexOf("Legal uci moves") > -1) {
        if (/Legal uci moves\: [a-h][1-8][a-h][1-8]/.test(data)) {
            good("**Found valid legal uci moves**");
            /// Make sure ponder works.
            write("go ponder");
            setTimeout(function ()
            {
                write("stop");
            }, 3000);
        } else {
            error("Cannot find valid legal uci moves.");
            throw new Error("Cannot find valid legal uci moves.");
        }
    }
    
    if (data.indexOf("bestmove") > -1) {
        good("**Found bestmove**");
        
        if (found_san_moves) {
            write("quit");
        } else {
            error("Did not find valid legal san moves.");
            throw new Error("Did not find valid legal san moves.");
        }
    }
});

stockfish.on("exit", function (code)
{
    if (code) {
        error("Exited with code: " + code);
        throw new Error("Exited with code: " + code);
    }
});


setTimeout(function ()
{
    write("uci");
}, 1000);

setTimeout(function ()
{
    error("Timeout");
    throw new Error("Timedout");
}, 1000 * 60 * 5).unref();
