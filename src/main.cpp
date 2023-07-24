/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2023 The Stockfish developers (see AUTHORS file)

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
#include "endgame.h"
#include "position.h"
#include "psqt.h"
#include "search.h"
#if !defined(CHESSCOM) && !defined(__EMSCRIPTEN__)
#include "syzygy/tbprobe.h"
#endif
#include "thread.h"
#include "tt.h"
#include "uci.h"

#if defined(__NON_NESTED_WASM__) || defined(__EMSCRIPTEN_SINGLE_THREADED__)
#include <emscripten.h>
#endif

using namespace Stockfish;

int main(int argc, char* argv[]) {

#if defined(__NON_NESTED_WASM__) || defined(__EMSCRIPTEN_SINGLE_THREADED__)
      emscripten_sleep(0);
#endif

  std::cout << engine_info() << std::endl;

  CommandLine::init(argc, argv);
#ifdef __NON_NESTED_WASM__
      emscripten_sleep(0);
#endif
  UCI::init(Options);
  Tune::init();
  PSQT::init();
  Bitboards::init();
  Position::init();
#ifdef __NON_NESTED_WASM__
      emscripten_sleep(0);
#endif
  Bitbases::init();
#ifdef __NON_NESTED_WASM__
      emscripten_sleep(0);
#endif
  Endgames::init();
  Threads.set(size_t(Options["Threads"]));
  Search::clear(); // After threads are up
  Eval::NNUE::init();

#ifdef __NON_NESTED_WASM__
      emscripten_sleep(0);
#endif

  UCI::loop(argc, argv);

#ifndef __EMSCRIPTEN_SINGLE_THREADED__

#ifdef __NON_NESTED_WASM__
  Threads.set(0);
  emscripten_force_exit(0);
#else
  Threads.set(0);
#endif

#endif // __EMSCRIPTEN_SINGLE_THREADED__

  return 0;
}

#ifdef __EMSCRIPTEN_SINGLE_THREADED__
extern "C" void init(int argc, char* argv[]) {
    main(argc, argv);
}
#endif

