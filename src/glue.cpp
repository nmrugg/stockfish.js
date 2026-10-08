/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2026 The Stockfish developers (see AUTHORS file)

  Stockfish is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.gnu.org/licenses/

  Stockfish is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Stockfish.  If not, see <http://www.gnu.org/licenses/>.
*/

#include "glue.hpp"

#include <emscripten.h>

#include <cstddef>
#include <utility>

CommandQueue inQ;

extern "C" {

// Called from the JS host with a NUL-terminated UTF-8 command. The pointer is
// owned by the caller (Emscripten's ccall "string" binding places it on the
// stack), so we only copy it into the queue.
EMSCRIPTEN_KEEPALIVE void uci(const char* utf8) {
    inQ.push(Command{std::string(utf8)});
}

}  // extern "C"

// Called by UCIEngine::loop() on the main (proxy) thread. Blocks until a
// command is available, then returns it.
std::string js_getline() {
    Command cmd = inQ.pop();
    return std::move(cmd.uci);
}
