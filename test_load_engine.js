var load_engine = require("./load_engine");
var stockfish = load_engine("stockfish");

stockfish.send("uci");

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

stockfish.stream = function stream_all(data)
{
    //console.log("stream: \"" + data + "\"");
}
