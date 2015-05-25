/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2008 Tord Romstad (Glaurung author)
  Copyright (C) 2008-2015 Marco Costalba, Joona Kiiski, Tord Romstad

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

/*
#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif
*/

#include <iostream>

#include "bitboard.h"
#include "evaluate.h"
#include "position.h"
#include "search.h"
#include "thread.h"
#include "tt.h"
#include "uci.h"

extern "C" void init() {

  std::cout << engine_info() << std::endl;
///emscripten_run_script("console.log('uci');console.time('uci')");
  UCI::init(Options);
///emscripten_run_script("console.timeEnd('uci')");
///emscripten_run_script("console.log('bitboards');console.time('bitboards')");
  Bitboards::init();
///emscripten_run_script("console.timeEnd('bitboards')"); 
///emscripten_run_script("console.log('position');console.time('position')");
  Position::init();
///emscripten_run_script("console.timeEnd('position')");
///emscripten_run_script("console.log('bitbases');console.time('bitbases')");
  Bitbases::init();
///emscripten_run_script("console.timeEnd('bitbases')");
///emscripten_run_script("console.log('search');console.time('search')");
  Search::init();
///emscripten_run_script("console.timeEnd('search')");
///emscripten_run_script("console.log('eval');console.time('eval')");
  Eval::init();
///emscripten_run_script("console.timeEnd('eval')");
///emscripten_run_script("console.log('pawns');console.time('pawns')");
  Pawns::init();
///emscripten_run_script("console.timeEnd('pawns')");
///emscripten_run_script("console.log('Threads');console.time('Threads')");
  Threads.init();
///emscripten_run_script("console.timeEnd('Threads')");
///emscripten_run_script("console.log('TT');console.time('TT')");
  TT.resize(Options["Hash"]);

///emscripten_run_script("console.timeEnd('TT')");
///emscripten_run_script("console.log('commandInit');console.time('commandInit')");
  UCI::commandInit();
///emscripten_run_script("console.timeEnd('commandInit')");
}

int main(int argc, char* argv[]) {
  init();

  std::string args;

  for (int i = 1; i < argc; ++i)
      args += std::string(argv[i]) + " ";

  if(!args.empty())
    UCI::command(args);

#ifndef EMSCRIPTEN
  std::string cmd;
  while(std::getline(std::cin, cmd))
    UCI::command(cmd);
#endif
}

extern "C" void uci_command(const char* cmd) {
    UCI::command(cmd);
}
