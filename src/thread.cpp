/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2008 Tord Romstad (Glaurung author)
  Copyright (C) 2008-2013 Marco Costalba, Joona Kiiski, Tord Romstad

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

#include <algorithm> // For std::count
#include <cassert>

#include "movegen.h"
#include "search.h"
#include "thread.h"
#include "ucioption.h"

using namespace Search;

ThreadPool Threads; // Global object

Thread::Thread() /* : splitPoints() */ { // Value-initialization bug in MSVC

  searching = false;
  maxPly = splitPointsSize = 0;
  activeSplitPoint = NULL;
  activePosition = NULL;
  idx = Threads.size();
}

// init() is called at startup to create and launch requested threads, that will
// go immediately to sleep due to 'sleepWhileIdle' set to true. We cannot use
// a c'tor becuase Threads is a static object and we need a fully initialized
// engine at this point due to allocation of Endgames in Thread c'tor.

void ThreadPool::init() {
  sleepWhileIdle = true;
  mainThread = new Thread();
}


// exit() cleanly terminates the threads before the program exits

void ThreadPool::exit() {
}
// wait_for_think_finished() waits for main thread to go to sleep then returns

void ThreadPool::wait_for_think_finished() {
}

// start_thinking() wakes up the main thread sleeping in MainThread::idle_loop()
// so to start a new search, then returns immediately.

void ThreadPool::start_thinking(const Position& pos, const LimitsType& limits,
                                const std::vector<Move>& searchMoves, StateStackPtr& states) {
  wait_for_think_finished();

  SearchTime = Time::now(); // As early as possible

  Signals.stopOnPonderhit = Signals.firstRootMove = false;
  Signals.stop = Signals.failedLowAtRoot = false;

  RootMoves.clear();
  RootPos = pos;
  Limits = limits;
  if (states.get()) // If we don't set a new position, preserve current state
  {
      SetupStates = states; // Ownership transfer here
      assert(!states.get());
  }

  for (MoveList<LEGAL> it(pos); *it; ++it)
      if (   searchMoves.empty()
          || std::count(searchMoves.begin(), searchMoves.end(), *it))
          RootMoves.push_back(RootMove(*it));

  Search::think();
}
