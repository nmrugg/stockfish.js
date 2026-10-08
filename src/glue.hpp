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

// Emscripten glue: a thread-safe command queue that bridges the JS host and
// the UCI loop running on the (proxy) main pthread. The host pushes commands
// via uci(); the loop() on the main thread pulls them via js_getline().

#ifndef GLUE_HPP_INCLUDED
#define GLUE_HPP_INCLUDED

#include <condition_variable>
#include <mutex>
#include <queue>
#include <string>
#include <utility>

struct Command {
    std::string uci;
};

struct CommandQueue {
    std::mutex              m;
    std::queue<Command>     q;
    std::condition_variable cv;

    void push(Command el) {
        {
            std::unique_lock<std::mutex> lock(m);
            q.push(std::move(el));
        }
        cv.notify_one();
    }

    Command pop() {
        std::unique_lock<std::mutex> lock(m);
        while (q.empty())
            cv.wait(lock);
        Command el = std::move(q.front());
        q.pop();
        return el;
    }
};

#endif  // GLUE_HPP_INCLUDED
