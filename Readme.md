### Stockfish.js

<a href="https://github.com/nmrugg/stockfish.js">Stockfish.js</a> is a fork of a <a href="https://github.com/exoticorn/stockfish-js">Stockfish-js</a> which is a fork of <a href="https://github.com/mcostalba/Stockfish">Stockfish</a>.
It currently runs Stockfish 5.

(NOTE: This readme is still in flux. Check back later.)

Stockfish.js is an emscripten port of the Stockfish chess engine.
(Emscripten being a c[++] to JavaScript compiler.)
This enables one to run one of the strongest chess engines available
without downloads or plugins in a web browser.
In Firefox, thanks to its asm.js support, it runs at a respectable
1/3 of the (single-threaded) speed of a native compile on my machine.
In Chrome it reaches about half the speed of FF, after a short
warm-up time.

### Download

Download Stockfish DD compiled to JavaScript:
[stockfish.js](https://github.com/exoticorn/stockfish-js/releases/download/sf_dd_js/stockfish.js)

### API

Stockfish.js is designed to run in a web-worker, which can be created
like this:

    var stockfish = new Worker("stockfish.js");

Input (standard UCI commands) to the engine is posted as a message to the worker:

    engine.postMessage("go depth 15");

The output of the engine is again posted as a message, to receive it
you need to install an event handler:

    engine.onmessage = function(event) {
      console.log(event.data);
    };

Since the engine cannot load an opening book from the file system, there
is a special message "{book: <binary polglot book data>}" to send a book
that you have downloaded yourself to the engine:

    var bookRequest = new XMLHttpRequest();
    bookRequest.open("GET", "book.bin", true);
    bookRequest.responseType = "arraybuffer";
    bookRequest.onload = function(event) {
      if(bookRequest.status == 200)
        engine.postMessage({book: bookRequest.response});
    };
    bookRequest.send(null);

### Note about pondering

The code has been slightly refactored to allow for pondering.
However, it can take a long time for Stockfish.js to receive the "stop" or "ponderhit" commands.
So it could be dangerous to use in a timed game.

In the future, it may be improved.

### Compiling

You need to have the emscripten compiler installed and in your path.
Then you can compile Stockfish.js like this:

    ./build.sh

### Example

There is an example implementation of a game against the computer in
the example folder. To run this, it needs to be served by a webserver.
If you have node.js, you can start a simple webserver in that directory
like this:

    node server.js

Alternatively, there is a online version of this example here:
[exoticorn.github.io/stockfish-js](http://exoticorn.github.io/stockfish-js)

The example uses [chess.js](http://github.com/jhlywa/chess.js)
and [chessboard.js](http://chessboardjs.com/) libraries.

You can also run Stockfish.js from the command line via `./stockfish.js` or `node src/stockfish.js`.

## Original Stockfish Readme:

### Overview

Stockfish is a free UCI chess engine derived from Glaurung 2.1. It is
not a complete chess program and requires some UCI-compatible GUI
(e.g. XBoard with PolyGlot, eboard, Arena, Sigma Chess, Shredder, Chess
Partner or Fritz) in order to be used comfortably. Read the
documentation for your GUI of choice for information about how to use
Stockfish with it.

This version of Stockfish supports up to 128 cores. The engine defaults
to one search thread, so it is therefore recommended to inspect the value of
the *Threads* UCI parameter, and to make sure it equals the number of CPU
cores on your computer.


### Files

This distribution of Stockfish consists of the following files:

  * Readme.md, the file you are currently reading.

  * Copying.txt, a text file containing the GNU General Public License.

  * src, a subdirectory containing the full source code, including a Makefile
    that can be used to compile Stockfish on Unix-like systems.


### Compiling it yourself

On Unix-like systems, it should be possible to compile Stockfish
directly from the source code with the included Makefile.

Stockfish has support for 32 or 64-bit CPUs, the hardware POPCNT
instruction, big-endian machines such as Power PC, and other platforms.

In general it is recommended to run `make help` to see a list of make
targets with corresponding descriptions. When not using the Makefile to
compile (for instance with Microsoft MSVC) you need to manually
set/unset some switches in the compiler command line; see file *types.h*
for a quick reference.


### Terms of use

Stockfish is free, and distributed under the **GNU General Public License**
(GPL). Essentially, this means that you are free to do almost exactly
what you want with the program, including distributing it among your
friends, making it available for download from your web site, selling
it (either by itself or as part of some bigger software package), or
using it as the starting point for a software project of your own.

The only real limitation is that whenever you distribute Stockfish in
some way, you must always include the full source code, or a pointer
to where the source code can be found. If you make any changes to the
source code, these changes must also be made available under the GPL.

For full details, read the copy of the GPL found in the file named
*Copying.txt*
