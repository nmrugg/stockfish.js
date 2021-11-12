;;
;; Generate feature_detection.wasm
;;
;;   wat2wasm --enable-simd -v feature_detection.wat -o feature_detection.wasm
;;   python replace_bytes.py feature_detection.wasm fdd5 fdba # replace `i64x2.mul` with `i32x4.dot_i16x8_s`
;;   python -c 'print([*open("feature_detection.wasm", "rb").read()])'
;;   [0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 15, 1, 13, 0, 65, 0, 253, 17, 65, 0, 253, 17, 253, 186, 1, 11]
;;

(module
  (func (export "test") (result v128)
    i32.const 0
    i32x4.splat
    i32.const 0
    i32x4.splat
    ;; NOTE:
    ;;   Actually `i32x4.dot_i16x8_s` is not even supported by wat2wasm(1.0.13)
    ;;   So here we temprary use `i64x2.mul` and replace this exact byte code later.
    i64x2.mul
  )
)
