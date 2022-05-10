#include "wasm_simd128.h"
#include <cstdio>

namespace emscripten_wasm_simd {

template<int n, int m, int n_stride>
void affine(const int8_t A[m][n_stride], const uint8_t x[n], const int32_t b[m], int32_t y[m]) {
  //
  // Dot product of two SIMD vectors
  //
  [[maybe_unused]] auto dot_i8x16 = [](__i8x16 a, __i8x16 b) -> __i32x4 {
    __i16x8 a_lo = wasm_i16x8_extend_low_i8x16(a);
    __i16x8 a_hi = wasm_i16x8_extend_high_i8x16(a);
    __i16x8 b_lo = wasm_i16x8_extend_low_i8x16(b);
    __i16x8 b_hi = wasm_i16x8_extend_high_i8x16(b);
    #if defined(USE_WASM_SIMD_POST_MVP)
      // [ With `i32x4.dot_i16x8_s` ]
      return wasm_i32x4_add(wasm_i32x4_dot_i16x8(a_lo, b_lo), wasm_i32x4_dot_i16x8(a_hi, b_hi));
    #else
      // [ Without `i32x4.dot_i16x8_s` ]
      // NOTE: This version is slower than running "dot_i16x8" twice. So not used when USE_WASM_SIMD_POST_MVP is off
      __i16x8 w_lo = wasm_i16x8_mul(a_lo, b_lo);
      __i16x8 w_hi = wasm_i16x8_mul(a_hi, b_hi);
      __i32x4 u_lo = wasm_i32x4_add(wasm_i32x4_extend_low_i16x8(w_lo), wasm_i32x4_extend_high_i16x8(w_lo));
      __i32x4 u_hi = wasm_i32x4_add(wasm_i32x4_extend_low_i16x8(w_hi), wasm_i32x4_extend_high_i16x8(w_hi));
      return wasm_i32x4_add(u_lo, u_hi);
    #endif
  };

  // (NOT USED)
  [[maybe_unused]] auto dot_i16x8 = [](__i16x8 a, __i16x8 b) -> __i32x4 {
    __i16x8 c = wasm_i16x8_mul(a, b);
    return wasm_i32x4_add(wasm_i32x4_extend_low_i16x8(c), wasm_i32x4_extend_high_i16x8(c));
  };

  //
  // Horizontal sum
  //
  [[maybe_unused]] auto hadd = [&](__i32x4 x0, __i32x4 x1) -> __i32x4 {
    return wasm_i32x4_add(wasm_i32x4_shuffle(x0, x1, 0, 2, 4, 6), wasm_i32x4_shuffle(x0, x1, 1, 3, 5, 7));
  };

  // (NOT USED)
  [[maybe_unused]] auto haddx4 = [&](__i32x4 x0, __i32x4 x1, __i32x4 x2, __i32x4 x3) -> __i32x4 {
    return hadd(hadd(x0, x1), hadd(x2, x3));
  };

  //
  // Dot product of two vectors
  //
  [[maybe_unused]] auto dot = [&](const int8_t* a, const uint8_t* x, const int32_t* b, int32_t* out) {
    __i32x4 z = wasm_i32x4_splat(0);
    #if defined(USE_WASM_SIMD_POST_MVP)
      for (int j = 0; j < n; j += 16) {
        z = wasm_i32x4_add(z, dot_i8x16(wasm_v128_load(&a[j]), wasm_v128_load(&x[j])));
      }
    #else
      for (int j = 0; j < n; j += 8) {
        z = wasm_i32x4_add(z, dot_i16x8(wasm_i16x8_load8x8(&a[j]), wasm_i16x8_load8x8(&x[j])));
      }
    #endif
    out[0] = b[0] + z[0] + z[1] + z[2] + z[3];
  };

  //
  // Four dot products (exploting horizontal sum)
  //
  [[maybe_unused]] auto dot4 = [&](const int8_t* a, const uint8_t* x, const int32_t* b, int32_t* out) {
    __i32x4 z0 = wasm_i32x4_splat(0);
    __i32x4 z1 = wasm_i32x4_splat(0);
    __i32x4 z2 = wasm_i32x4_splat(0);
    __i32x4 z3 = wasm_i32x4_splat(0);
    #if defined(USE_WASM_SIMD_POST_MVP)
      for (int j = 0; j < n; j += 16) {
        __i8x16 xv = wasm_v128_load(&x[j]);
        z0 = wasm_i32x4_add(z0, dot_i8x16(wasm_v128_load(&a[j + 0 * n_stride]), xv));
        z1 = wasm_i32x4_add(z1, dot_i8x16(wasm_v128_load(&a[j + 1 * n_stride]), xv));
        z2 = wasm_i32x4_add(z2, dot_i8x16(wasm_v128_load(&a[j + 2 * n_stride]), xv));
        z3 = wasm_i32x4_add(z3, dot_i8x16(wasm_v128_load(&a[j + 3 * n_stride]), xv));
      }
    #else
      for (int j = 0; j < n; j += 8) {
        __i16x8 xv = wasm_i16x8_load8x8(&x[j]);
        z0 = wasm_i32x4_add(z0, dot_i16x8(wasm_i16x8_load8x8(&a[j + 0 * n_stride]), xv));
        z1 = wasm_i32x4_add(z1, dot_i16x8(wasm_i16x8_load8x8(&a[j + 1 * n_stride]), xv));
        z2 = wasm_i32x4_add(z2, dot_i16x8(wasm_i16x8_load8x8(&a[j + 2 * n_stride]), xv));
        z3 = wasm_i32x4_add(z3, dot_i16x8(wasm_i16x8_load8x8(&a[j + 3 * n_stride]), xv));
      }
    #endif
    __i32x4 z = wasm_i32x4_add(wasm_v128_load(&b[0]), haddx4(z0, z1, z2, z3));
    wasm_v128_store(&out[0], z);
  };

  //
  // Affine
  //
  // 2048x8
  ///TODO: Does this need to be modified into 1024x16?
  /// Cf. https://github.com/hi-ogawa/Stockfish/blob/dc8e726a4e5ea74ab2b8354f82c03878117a0819/src/emscripten/wasm_simd.cpp
  if constexpr (n % 16 == 0 && m % 4 == 0) {
    for (int i = 0; i < m; i += 4) {
      dot4(&A[i][0], &x[0], &b[i], &y[i]);
    }

  // 8x32, 32x1 (it doesn't worth optimizing such small kernels)
  } else {
    for (int i = 0; i < m; i++) {
      y[i] = b[i];
      for (int j = 0; j < n; j++) {
        y[i] += A[i][j] * x[j];
      }
    }
  }
}

// Explicit instantiation
template void affine<1024, 16, 1024>(const int8_t A[16][1024], const uint8_t x[1024], const int32_t b[16], int32_t y[16]);
template void affine<  16, 32,   32>(const int8_t A[32][  32], const uint8_t x[  16], const int32_t b[32], int32_t y[32]);
template void affine<  32,  1,   32>(const int8_t A[ 1][  32], const uint8_t x[  32], const int32_t b[ 1], int32_t y[ 1]);

} // namespace emscripten_wasm_simd
