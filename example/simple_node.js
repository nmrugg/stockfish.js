#!/usr/bin/env node

var stockfish = require("./stockfish.js");
var engine = stockfish();
var position = "startpos";
var got_uci;
var started_thinking;

function send(str)
{
    console.log("Sending: " + str)
    engine.postMessage(str);
}

if (process.argv[2] === "--help") {
    console.log("Usage: node simple_node.js [FEN OR move1 move2 ...moveN]");
    console.log("");
    console.log("Examples:");
    console.log("   node simple_node.js");
    console.log("   node simple_node.js \"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2\"");
    console.log("   node simple_node.js g1f3 e7e5");
    process.exit();
}

engine.onmessage = function (line)
{
    var match;
    console.log("Line: " + line)
    
    if (typeof line !== "string") {
        console.log("Got line:");
        console.log(typeof line);
        console.log(line);
        return;
    }
    
    if (!got_uci && line === "uciok") {
        got_uci = true;
        if (position) {
            send("position " + position);
            send("eval");
            send("d");
        }
        
        send("go ponder");
    } else if (!started_thinking && line.indexOf("info depth") > -1) {
        console.log("Thinking...");
        started_thinking = true;
        setTimeout(function ()
        {
            send("stop");
        }, 1000 * 10);
    } else if (line.indexOf("bestmove") > -1) {
        match = line.match(/bestmove\s+(\S+)/);
        if (match) {
            console.log("Best move: " + match[1]);
            process.exit();
        }
    }
};

(function get_position()
{
    var i,
        len,
        temp_arr;
    
    if (process.argv.length > 2) {
        /// Does it look like FEN?
        if (process.argv.length === 3 && process.argv[2].indexOf("/") > -1) {
            position = "fen " + process.argv[2];
        } else {
            temp_arr = [];
            len = process.argv.length;
            for (i = 2; i <= len; i += 1) {
                temp_arr[temp_arr.length] = process.argv[i];
            }
            position = "startpos moves " + temp_arr.join(" ");
        }
    }
}());

send("uci");
