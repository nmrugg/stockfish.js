EXE = stockfish.js
COMP = em++
CXX = em++
comp = clang
arch = wasm
bits = 64

# Build options
wasm_simd = no
wasm_simd_post_mvp = yes
minify_js = yes
assertion = no
embedded_nnue = yes

VPATH := $(VPATH):emscripten


ifeq ($(CHESSCOM),1)
	CXXFLAGS += -DCHESSCOM
	CXXFLAGS += -D__EMSCRIPTEN_PTHREADS__
	EM_CXXFLAGS +=
	EM_LDFLAGS += \
		--pre-js emscripten/pre.js \
		--extern-pre-js emscripten/extern-pre.js \
		--extern-post-js emscripten/extern-post.js \
		-s MODULARIZE=1 -s EXPORT_NAME="Stockfish" -s ENVIRONMENT=web,worker,node \
		-s STRICT=1 \
		-s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=["emscripten_utils_getline_impl"]' \
		-s USE_PTHREADS=1 \
		-s PROXY_TO_PTHREAD=1 \
		-s ALLOW_MEMORY_GROWTH=0 -s INITIAL_MEMORY=1073741824 \
		-s FILESYSTEM=0 \
		-s EXPORTED_RUNTIME_METHODS=[]
else
	EM_CXXFLAGS +=
	EM_LDFLAGS += \
		--pre-js emscripten/preamble.js \
		-s MODULARIZE=1 -s EXPORT_NAME="Stockfish" -s ENVIRONMENT=web,worker,node \
		-s STRICT=1 \
		-s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=["emscripten_utils_getline_impl"]' \
		-s USE_PTHREADS=1 \
		-s PROXY_TO_PTHREAD=1 \
		-s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=$$((1 << 27)) -s MAXIMUM_MEMORY=$$((1 << 31)) \
		-s FILESYSTEM=0 \
		-s EXTRA_EXPORTED_RUNTIME_METHODS=[] \
		-s ALLOW_UNIMPLEMENTED_SYSCALLS
endif

ifeq ($(EMBED_NNUE),yes)
	embedded_nnue = yes
else
	embedded_nnue = no
	EM_LDFLAGS += -s FETCH=1
endif

ifeq ($(NOJSMINIFY),yes)
	minify_js = no
endif

ifeq ($(DEBUGWASM),1)
	EM_LDFLAGS += -s ASSERTIONS=2
	EM_LDFLAGS += -s SAFE_HEAP=1
	assertion = yes
	minify_js = yes
endif

ifeq ($(minify_js),yes)
	EM_LDFLAGS += --closure 1
else
	EM_LDFLAGS += --closure 0 --minify 0
endif

ifeq ($(assertion),yes)
	EM_LDFLAGS += -s ASSERTIONS=1
else
	EM_LDFLAGS += -s ASSERTIONS=0
endif

ifeq ($(wasm_simd_post_mvp),yes)
	EM_CXXFLAGS += -DUSE_WASM_SIMD -DUSE_WASM_SIMD_POST_MVP -msimd128
	SRCS += emscripten/wasm_simd.cpp
	sse = yes
	sse2 = yes
	ssse3 = yes
	sse41 = yes
else ifeq ($(wasm_simd),yes)
	EM_CXXFLAGS += -DUSE_WASM_SIMD -msimd128
	SRCS += emscripten/wasm_simd.cpp
endif

ifeq ($(embedded_nnue),yes)
	SRCS += emscripten/embedded_nnue.cpp
else
	EM_CXXFLAGS += -DNNUE_EMBEDDING_OFF
endif

ifeq ($(CHESSCOM),1)
	# Remove tablebase code
	TMPVAR1 := $(SRCS)
	SRCS = $(filter-out syzygy%, $(TMPVAR1))
	TMPVAR2 := $(OBJS)
	OBJS = $(filter-out tbprobe%, $(TMPVAR2))
endif

EXTRACXXFLAGS += -DUSE_POPCNT $(EM_CXXFLAGS)
EXTRALDFLAGS += $(EM_LDFLAGS)

ifeq ($(embedded_nnue),yes)
emscripten/embedded_nnue.cpp: net
	@echo "-- Generate embedded_nnue.cpp --"
	python emscripten/misc/embedded_nnue.py $(nnuenet) > emscripten/embedded_nnue.cpp
endif

emscripten_copy_files:
	cp -f ../AUTHORS ../Copying.txt emscripten/public
	cp -f stockfish.js stockfish.wasm emscripten/public
	cat stockfish.worker.js emscripten/worker-postamble.js > emscripten/public/stockfish.worker.js

emscripten_build: build emscripten_copy_files
#emscripten_build:
#	@echo ""
#	@echo $(OBJS)
#	@echo ""
#	@echo $(SRCS)
