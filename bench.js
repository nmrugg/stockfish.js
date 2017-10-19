var load_engine = require("./load_engine");
var stockfish = load_engine(process.argv[2] || "./stockfishjs");
var assert = require("assert");

var time;
var timeEnd;

(function ()
{
    var times = {};
    
    time = function (name)
    {
        times[name] = process.hrtime();
    }
    
    timeEnd = function(name)
    {
        var diff = process.hrtime(times[name]);
        delete times[name];
        console.log((typeof name === "undefined" ? "benchmark" : name) + ": %d second(s)", (diff[0] * 1e9 + diff[1]) / 1000000000);
    }
}());
//var stockfish = load_engine("stockfish");

time("Start up");
stockfish.send("uci", function ()
{
    timeEnd("Start up");
    stockfish.send("isready");
    
    time("d");
    stockfish.send("d", function (str)
    {
        timeEnd("d");
        //console.log(str);
        time("eval");
        stockfish.send("eval", function (str)
        {
            timeEnd("eval");
            //console.log(str);
            
            time("go depth 7");
            stockfish.send("go depth 7", function ongo(str)
            {
                var expectedMove = "g1f3",
                    expectedPonder = "g8f6";
                
                timeEnd("go depth 7");
                //console.log("Stockfish says best move: " + str.match(/bestmove (\S+)/)[1]);
                assert.equal(expectedMove, str.match(/bestmove (\S+)/)[1]);
                assert.equal(expectedPonder, str.match(/ponder (\S+)/)[1]);
                stockfish.send("quit");
            }, function thinking(str)
            {
                //console.log("thinking: " + str);
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