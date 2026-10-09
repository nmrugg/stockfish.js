#!/usr/bin/env node

/// This is an example of how to use a UCI engine by directly executing the code, listening to STDOUT, and writing to STDIN.
/// This could work with any UCI compatible engine, even standard binary engines, if process.execPath is removed.

/// Make sure the engine is present.
require("./get-engine.js");

var engine = require("child_process").spawn(process.execPath, [require("stockfish").findEngine(process.argv[2] || "full")], {stdio: "pipe"});
var engineStarted = false;

engine.stdout.on("data", echo);

function echo(data)
{
    ///NOTE: .slice(0, -1) is simply to remove the trailing new line.
    var line = data.toString().slice(0, -1);
    
    console.log("STDOUT:", line);

    if (!engineStarted) {
        engineStarted = true;
        setImmediate(onStart);
    }

    if (/^bestmove \S+/.test(line)) {
        console.log("The best move is " + line.match(/bestmove (\S+)/)[1] + ".");
        engine.kill();
    }
}

function sendCommand(cmd)
{
    engine.stdin.write(cmd + "\n");
}

function onStart()
{
    sendCommand("go infinite");
    setTimeout(sendCommand, 1000, "stop");
}
