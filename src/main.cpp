/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2026 The Stockfish developers (see AUTHORS file)

  Stockfish is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Stockfish is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#include <iostream>
#include <memory>
#include <utility>

#include "attacks.h"
#include "misc.h"
#include "position.h"
#include "tune.h"
#include "uci.h"

using namespace Stockfish;

#ifdef __EMSCRIPTEN__
UCIEngine* uciP; // Create a global pointer to the UCI object
    #ifndef __EMSCRIPTEN_SINGLE_THREADED__
        bool ready = false;
    #endif
#endif

#ifdef UNIVERSAL_BINARY
namespace Stockfish {

int main(int argc, char* argv[]);  // silence 'no previous declaration'

__attribute__((used)) // keep main alive
#endif

int main(int argc, char* argv[]) {
    std::cout << engine_info() << std::endl;

    Attacks::init();
    Position::init();

#ifdef __EMSCRIPTEN__
    uciP = new UCIEngine(argc, argv); // initialize the UCI object
    Tune::init(uciP->engine_options());
#ifndef __EMSCRIPTEN_SINGLE_THREADED__
    ready = true;
    // Multithreaded: the UCI loop runs on the (proxy) main thread and pulls
    // commands from a thread-safe queue that the JS host pushes onto (see glue.cpp).
    // main() blocks here, but that is fine because it runs on W1, a separate pthread.
    uciP->loop();
#endif
    // Single-threaded: return from main(). There is no separate (proxy) main
    // thread, so blocking in loop() would stall the only thread (and the JS
    // event loop / readline). Commands are processed on demand via the
    // command() ccall (process_command), which ASYNCIFY can suspend/resume.
#else
    auto cli = CommandLine(argc, argv);
    auto uci = std::make_unique<UCIEngine>(std::move(cli));

    Tune::init(uci->engine_options());

    uci.loop();
#endif

    return 0;
}

#ifdef UNIVERSAL_BINARY
}  // namespace Stockfish

    #ifdef UNIVERSAL_NEEDS_MAIN_SHIM
int main(int argc, char* argv[]) { return Stockfish::main(argc, argv); }
    #endif
#endif

#ifdef __EMSCRIPTEN__
    #ifdef __EMSCRIPTEN_SINGLE_THREADED__
    // Single-threaded: the JS host processes commands on demand via this ccall
    // (ASYNCIFY suspends/resumes around any blocking work). The multithreaded
    // build does not use this; it pushes commands onto the glue queue (uci())
    // which uciP->loop() on the (proxy) main thread consumes.
    extern "C" void command(const char* cmd) {
        uciP->process_command(cmd);
    }
    #endif
    #ifndef __EMSCRIPTEN_SINGLE_THREADED__
    extern "C" bool isReady() {
        return ready;
    }
    #endif
#endif
