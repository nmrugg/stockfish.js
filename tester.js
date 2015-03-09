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
    //process.stdout.write(data)
    if (data.indexOf("uciok") > -1) {
        stockfish.stdin.write("ucinewgame\n");
        stockfish.stdin.write("isready\n");
        stockfish.stdin.write("position startpos moves e2e3\n");
        stockfish.stdin.write("eval\n");
        stockfish.stdin.write("go depth 1 wtime 300000 winc 2000 btime 300000 binc 2000\n");
    }
    if (data.indexOf("bestmove") > -1) {
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
