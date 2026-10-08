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

#ifndef UCI_H_INCLUDED
#define UCI_H_INCLUDED

#include <iostream>
#include <string>
#include <string_view>

#include "engine.h"
#include "misc.h"
#include "search.h"

namespace Stockfish {

class Position;
class Move;
class Score;
enum Square : u8;
using Value = int;

constexpr auto StartFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

class UCIEngine {
   public:
   
#ifdef __EMSCRIPTEN__
    UCIEngine(int argc, char** argv);
    #ifdef __EMSCRIPTEN_SINGLE_THREADED__
    // Single-threaded: a command is processed on demand (from the JS ccall).
    // main() returns after setup; the loop() design is not used because there
    // is no separate (proxy) main thread to block on.
    void process_command(std::string cmd);
    #else
    // Multithreaded: the UCI loop runs on the (proxy) main thread and pulls
    // commands from the glue queue (js_getline()).
    void loop();
    #endif
#else
    UCIEngine(CommandLine cli);
    // Native: the UCI loop reads commands from std::cin.
    void loop();
#endif

    static int         to_cp(Value v, const Position& pos);
    static std::string format_score(const Score& s);
    static std::string square(Square s);
    static std::string move(Move m, bool chess960 = false);
    static std::string wdl(Value v, const Position& pos);
    static std::string to_lower(std::string str);
    static Move        to_move(const Position& pos, std::string str);

    Search::LimitsType parse_limits(std::istream& is);

    auto& engine_options() { return engine.get_options(); }

   private:
    Engine      engine;
    CommandLine cli;
    std::string currentCmd;

    // Processes a single UCI command string. Returns the first token (so the
    // caller can detect "quit"). Shared by loop() and process_command().
    std::string process_cmd(const std::string& cmd);

    static void print_info_string(std::string_view str);

    void go(std::istringstream& is);
    void bench(std::istream& args);
    void benchmark(std::istream& args);
    void position(std::istringstream& is);
    void setoption(std::istringstream& is);
    u64  perft(const Search::LimitsType&);

    static void on_update_no_moves(const Engine::InfoShort& info);
    static void on_update_full(const Engine::InfoFull& info, bool showWDL);
    static void on_iter(const Engine::InfoIter& info);
    static void on_bestmove(std::string_view bestmove, std::string_view ponder);

    void init_search_update_listeners();

    [[noreturn]] void terminate_on_critical_error(const std::string& message);
};

}  // namespace Stockfish

#endif  // #ifndef UCI_H_INCLUDED
