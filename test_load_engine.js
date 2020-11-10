var load_engine = require("./load_engine");
///load_engine.log = 1; /// For debugging
var stockfish = load_engine("stockfishjs");

stockfish.send("uci", function (uciData)
{
    if (!/option name/.test(uciData)) {
        throw new Error("UCI data is bad:\n" + uciData);
    } else {
        console.log("UCI passes");
    }
    stockfish.send("isready", function (readyok)
    {
        if (readyok === "readyok") {
            console.log("isready passes");
        } else {
            throw new Error("isReady failed:\n" + readyok);
        }
    });
    stockfish.send("d", function (str)
    {
        console.log(str);
        stockfish.send("eval", function (str)
        {
            console.log(str);
            
            stockfish.send("go depth 7", function ongo(str)
            {
                console.log("Stockfish says best move: " + str.match(/bestmove (\S+)/)[1]);
                stockfish.send("quit");
            }, function thinking(str)
            {
                console.log("thinking: " + str);
            });
        });
    });
});

/*
var fruit = load_engine("fruit");
fruit.send("uci");
fruit.send("go depth 7", function ongo(str)
{
    console.log("Fruit says best move: " + str.match(/bestmove (\S+)/)[1]);
    fruit.send("quit");
}, function thinking(str)
{
    //console.log("thinking: " + str);
});
*/
/*

stockfish.send("uci", function ()
{
    stockfish.send("isready");
    stockfish.send("d", function (str)
    {
        //console.log(str);
        stockfish.send("eval", function (str)
        {
            //console.log(str);
            
            stockfish.send("go depth 7", function ongo(str)
            {
                console.log("Stockfish says best move: " + str.match(/bestmove (\S+)/)[1]);
                stockfish.send("quit");
            }, function thinking(str)
            {
                //console.log("thinking: " + str);
            });
        });
    });
});
*/
/*
stockfish.send("bench", function (str)
{
    console.log(str);
    //process.exit();
    //stockfish.send("uci");
    
    stockfish.send("d", function ond(d)
    {
        console.log(d);
        //process.exit();
    });
    stockfish.send("go depth 3", function ongo(str)
    {
        console.log("found best move: " + str);
        process.exit();
    }, function thinking(str)
    {
        console.log("thinking: " + str);
    });
});
//stockfish.send("uci");

stockfish.stream = function stream_all(data)
{
    console.log("stream: \"" + data + "\"");
}
*/
