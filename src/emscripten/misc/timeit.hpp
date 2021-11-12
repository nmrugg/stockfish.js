//
// Python timeit style benchamrk (copied from https://github.com/hi-ogawa/toy-chess/blob/master/src/timeit.hpp)
//

namespace timeit {

  using Clock = std::chrono::high_resolution_clock;
  using Second = double;

  template<class Duration>
  inline Second toSecond(Duration duration) {
    return std::chrono::duration_cast<std::chrono::nanoseconds>(duration).count() / 1e9;
  }

  // mean, std, max, min, loop_size, num_trials
  using Result = std::tuple<Second, Second, Second, Second, int64_t, int64_t>;

  // Trick from Catch::Benchmark::deoptimize_value (https://github.com/catchorg/Catch2/blob/devel/src/catch2/benchmark/catch_optimizer.hpp)
  template <typename T>
  inline void deoptimize(T&& x) {
    asm volatile("" : : "g"(&x) : "memory");
  }

  template<class FuncT>
  struct Timer {
    FuncT func;
    Timer(FuncT _func) : func{_func} {}

    Second run(int64_t n) {
      auto start = Clock::now();
      for (int64_t i = 0; i < n; i++) { deoptimize(func()); }
      auto finish = Clock::now();
      return toSecond(finish - start);
    }

    Result repeat(int64_t n, int64_t r) {
      Second mean = 0, moment2 = 0;
      Second run_max = -1e18, run_min = 1e18;
      for (int i = 0; i < r; i++) {
        Second s = run(n) / n;
        mean += s;
        moment2 += s * s;
        run_max = std::max(run_max, s);
        run_min = std::min(run_min, s);
      }
      mean /= r;
      moment2 /= r;
      Second stddev = std::sqrt(moment2 - mean * mean);
      return {mean, stddev, run_max, run_min, n, r};
    }

    int64_t autoRange(Second limit = 0.1) {
      for (int64_t k = 1; ; k *= 10) {
        for (auto step : {1, 2, 4, 8}) {
          int64_t n = step * k;
          if (limit < run(n)) { return n; }
        }
      }
      return -1;
    }
  };


  template<class FuncT>
  inline Result run(FuncT func, int64_t n = 0, int64_t r = 10) {
    auto timer = Timer(func);
    if (n == 0) { n = timer.autoRange(); }
    return timer.repeat(n, r);
  }

  constexpr std::array<std::pair<const char*, double>, 4> kTimeUnits = {{
    {"nsec", 1e9}, {"usec", 1e6}, {"msec", 1e3}, {"sec", 1e0}}};

  inline int autoTimeUnit(Second t) {
    for (int i = 0; i < 3; i++) {
      auto [_unit, scale] = kTimeUnits[i];
      if (t * scale < 1e3) { return i; }
    }
    return 3;
  }

  inline std::string formatTime(Second t, int unit_idx, bool show_unit = 1) {
    auto [unit, scale] = kTimeUnits[unit_idx];
    auto res = std::to_string(t * scale);
    if (show_unit) { res = res + " " + unit; }
    return res;
  }

  struct Printer {
    Result result;

    void print(std::ostream& ostr) const {
      auto [mean, stddev, max, min, n, r] = result;
      int i = autoTimeUnit(mean);
      ostr << formatTime(mean, i) << " "
        << "("
        << "stddev: " << formatTime(stddev, i, 0) << ", "
        << "min: "    << formatTime(min, i, 0)    << ", "
        << "max: "    << formatTime(max, i, 0)    << ", "
        << "n: "      << n                        << ", "
        << "r: "      << r
        << ")";
    }

    friend std::ostream& operator<<(std::ostream& ostr, const Printer& self) { self.print(ostr); return ostr; }
  };

  template<class FuncT>
  inline Printer timeit(FuncT func, int64_t n = 0, int64_t r = 10) {
    return Printer{run(func, n, r)};
  }

} // namespace timeit
