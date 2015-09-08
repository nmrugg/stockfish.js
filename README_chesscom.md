# Chess.com Stockfish.js Fork

## Origin and Future

This fork is based on

 * https://github.com/exoticorn/stockfish-js

and diverges after exoticorn/stockfish-js@79659c5 .

The future goal is to rebase on another exoticorn fork which is being
actively developed

 * https://github.com/nmrugg/stockfish.js

TODO: benchmark this repo against current nmrugg/stockfish.js.

## Build and Deployment

The current deployment system is simple/manual.

### Compile

`stockfish.js` is produced by the command

```bash
$ make build ARCH=js
```

### Optimizations

TODO: determine optimization/uglification step that belongs here.  See other
*Optimizations* section below.

### Testing

TODO: there is no working suite.  Some tests can be found under

 * https://github.com/ChessCom/jsChessEngine/tree/master/tests

but they are currently broken, and seem to have always been browser-only
(not node/CLI).

### Check-in

The compiled `stockfish.js` is manually checked in to the jsChessEngine repo
at

 * https://github.com/ChessCom/jsChessEngine/blob/master/src/engineworker.js

Note: it is checked in under a new filename, `engineworker.js`.

### Deployment

Periodically, assets from the jsChessEngine repo are manually checked in to
the chess.com v3 webapp repo under

 * https://github.com/ChessCom/chess/blob/develop/app/Resources/assets/js/vendor/jschessengine/

Note: check in to `develop` branch only, for v3.  Anything checked into this
branch must be eligible for deployment.

### Deployment TODO

 * there should at least be a shell script to map the subset of assets in
   jsChessEngine, to their new paths in v3.
 * since this repo is functionally interdependent with jsChessEngine, the
   two repos should be merged.  The best model is for jsChessEngine to be
   integrated here and then decommissioned.
 * ideally the build process would not be manual, though changing that would
   require adding emscripten and its dependencies to the deploy hosts, which
   is a fair amount of complexity.

## JSON output

When compiled with emscripten this fork returns all output in JSON to
facilitate interaction with JavaScript applications in-browser.

Some outputs have been modified to include additional data not presented in
the UCI protocol.  An example follows of a best move search result in JSON
form:

```json
{
    "rootFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "rootTurn": "w",
    "depth": 13,
    "score": 0.18,
    "move": {
        "from": "e2",
        "to": "e4",
        "promotion": null
    },
    "moveSan": "e4",
    "moveLan": "e2e4",
    "pv": ["e4", "e5", "Nc3", "Nf6", "Nf3", "Nc6", "Bb5", "Bc5", "O-O", "O-O", "Bxc6", "dxc6", "Nxe5"],
    "mateIn": null
}
```

TODO: the various outputs should be described more precisely, or perhaps
consolidated/linked to https://github.com/ChessCom/jsChessEngine/blob/master/README.md

## Other changes

TODO: there are several other changes to Stockfish logic which must either
be documented or removed.

## Changeset from Phillip Albanese

Starting at commit `f6e94d5` "use === in JS", this repo contains a series of
changes based on Phillip Albanese's working tree at the time that he passed
away.

Some modifications to Phillip's work were made during the process of
committing, such as tucking the JSON interface within `ifdef`s, as generally
noted in the git log.

Besides what is noted in the log, the following changes existed in Phillip's
working tree, but were *not* carried forward (and are not described elsewhere):

 * `polyglot.ini` was missing or had reverted official-stockfish/Stockfish@88b5100
 * `polyglot.ini` had extra entry "Idle Threads Sleep"
 * the signature for `uci_pv` was missing `alpha` and `beta`, as if
   official-stockfish/Stockfish@abc6a0b was partially reverted.
 * `--closure 1` was removed from `LDFLAGS` in Makefile.  Per nmrugg/stockfish.js@fb30215,
   that option breaks the build.  Most likely the compile environment
   Phillip was using lacked Java, causing that option to be a no-op.

## book.bin modifications

The PolyGlot book used by this engine in production

 * https://github.com/ChessCom/chess/blob/develop/app/Resources/assets/js/vendor/jschessengine/books/book.bin

is reported to have modifications to make play-vs-computer more
human-like in the v3 webapp.

We do not have any sources/diffs for these modifications, only
the binary `book.bin`.

## Optimizations

The precise optimization/uglification steps Phillip used to produce

 * https://github.com/ChessCom/chess/blob/0972e00a2228330b0bbb4ce1278b6f4862af9a7b/app/Resources/assets/js/vendor/jschessengine/engineworker.js

have not been duplicated.  Whether or not that is important is not
known.

TODO: benchmark a newly-compiled version against the optimized JS
above.

## Other Future TODOs and Possibilities

 * there are numerous questions and todos marked out in
     - comments within `#ifdef EMSCRIPTEN` blocks
     - comments within `#ifndef EMSCRIPTEN` blocks
     - commit messages by Roland Walker from 2015-09-07 - 2015-09-08

 * rebasing on nmrugg/stockfish.js means upgrading to Stockfish 6,
   which means giving up book support.  We can port to the chess.com
   book at the application layer, but this is complicated by the
   existence of unknown modifications to `book.bin` (see above)

 * use an independent symbol for switching to JSON output such as
   `-DJSON` instead of `-DEMSCRIPTEN`, and/or (better) accept a UCI
   command which toggles JSON mode, but (next item)

 * it seems silly to emit JSON output without accepting JSON input.
   JSON input is currently handled by the [jschessengine.js wrapper](https://github.com/ChessCom/jsChessEngine/blob/master/src/jschessengine.js).
   The most logical architecture would be to handle all JSON conversion
   at the boundary, in the wrapper, removing JSON from the C++.

   The C++ patch should in principle be held at the minimum to ease
   tracking of official Stockfish development.

   However, some portions of commit b3e8c4b "JSON interface when
   compiled with emscripten" also add new info rather than simply
   reformatting as JSON.

 * JSON interface to full `eval` breakdown for future applications.
