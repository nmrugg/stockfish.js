/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2024 The Stockfish developers (see AUTHORS file)

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

#include "bitboard.h"
#include "misc.h"
#include "position.h"
#include "types.h"
#include "uci.h"
#include "tune.h"

using namespace Stockfish;

#ifdef __EMSCRIPTEN__
UCIEngine* uciP; // Create a global pointer to the UCI object
    #ifndef __EMSCRIPTEN_SINGLE_THREADED__
        bool ready = false;
    #endif
#endif

int main(int argc, char* argv[]) {

    std::cout << engine_info() << std::endl;

    Bitboards::init();
    Position::init();
    
#ifndef __EMSCRIPTEN__
    UCIEngine uci(argc, argv);

    Tune::init(uci.engine_options());

    uci.loop();
#else
    uciP = new UCIEngine(argc, argv); // initialize the UCI object
    Tune::init(uciP->engine_options());
    #ifndef __EMSCRIPTEN_SINGLE_THREADED__
        ready = true;
    #endif
#endif

    return 0;
}

#ifdef __EMSCRIPTEN__
extern "C" void command(const char *cmd) {
    uciP->process_command(cmd);
}
    #ifndef __EMSCRIPTEN_SINGLE_THREADED__
    extern "C" bool isReady() {
        return ready;
    }
    #endif
#endif
