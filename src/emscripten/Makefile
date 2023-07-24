wasm_simd_post_mvp = no
EXE = stockfish.js
COMP = em++
CXX = em++
comp = clang
arch = wasm
bits = 64

# Build options
wasm_simd ?= no
wasm_simd_post_mvp ?= yes
any_simd ?= no
minify_js ?= yes
assertion ?= no
embedded_nnue ?= yes
use_wasm_pthreads ?= yes

extern_post_js ?= emscripten/extern-post.js
extern_pre_js ?= emscripten/extern-pre.js
pre_js ?= emscripten/pre.js

VPATH := $(VPATH):emscripten

ifeq ($(use_wasm_pthreads),no)
	wasm_simd_post_mvp = no
	wasm_simd = no
	WASMNONNESTED = no
endif


ifeq ($(wasm_simd_post_mvp),yes)
	any_simd = yes
else ifeq ($(wasm_simd),yes)
	any_simd = yes
endif


# -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=71303168 -s MAXIMUM_MEMORY=2147483648 \
# -s ALLOW_MEMORY_GROWTH=0 -s INITIAL_MEMORY=277872640 \

ifeq ($(CHESSCOM),1)
	ifeq ($(use_wasm_pthreads),yes)
		CXXFLAGS += -D__EMSCRIPTEN_PTHREADS__
		EM_LDFLAGS += -s USE_PTHREADS=1
		ifeq ($(WASMNONNESTED),yes)
			EM_LDFLAGS += -s PTHREAD_POOL_SIZE=4
		else
			EM_LDFLAGS += -s PROXY_TO_PTHREAD=1
		endif
	else
		EM_LDFLAGS += -s USE_PTHREADS=0 -s NO_EXIT_RUNTIME=1
		CXXFLAGS += -D__EMSCRIPTEN_SINGLE_THREADED__
		extern_post_js = emscripten/extern-post-async.js
		extern_pre_js = emscripten/extern-pre-async.js
		EM_LDFLAGS += -s EXPORTED_FUNCTIONS="['_stop', '_ponderhit', '_main']"
	endif
	
	ifeq ($(WASMNONNESTED),yes)
		CXXFLAGS += -D__NON_NESTED_WASM__
		EM_CXXFLAGS += -s EXIT_RUNTIME
		extern_post_js = emscripten/extern-post-async.js
		extern_pre_js = emscripten/extern-pre-async.js
		pre_js = emscripten/pre-non-nested.js
	endif
	CXXFLAGS += -DCHESSCOM
	EM_CXXFLAGS +=
	EM_LDFLAGS += \
		-s MODULARIZE=1 -s EXPORT_NAME="Stockfish" -s ENVIRONMENT=web,worker,node \
		-s STRICT=1 \
		-s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=["emscripten_utils_getline_impl"]' \
		-s FILESYSTEM=0 \
		-s EXPORTED_RUNTIME_METHODS=[] \
		--pre-js $(pre_js) \
		--extern-pre-js $(extern_pre_js) \
		--extern-post-js $(extern_post_js)
	ifeq ($(any_simd),no)
		EM_LDFLAGS += --post-js emscripten/post-no-simd.js
	endif
	ifeq ($(WASMGROWMEM),yes)
		EM_LDFLAGS += -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=71303168 -s MAXIMUM_MEMORY=2147483648
	else
		ifeq ($(WASMLOWMEM),yes)
			CXXFLAGS += -DWASMLOWMEM
			EM_LDFLAGS += -s ALLOW_MEMORY_GROWTH=0 -s INITIAL_MEMORY=277872640
		else
			EM_LDFLAGS += -s ALLOW_MEMORY_GROWTH=0 -s INITIAL_MEMORY=536870912
		endif
	endif
	ifeq ($(use_wasm_pthreads),no)
		EM_LDFLAGS += --pre-js emscripten/pre-single-threaded.js
	endif
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
	EM_LDFLAGS += -s ASSERTIONS=2 -s SAFE_HEAP=1 -gsource-map --source-map-base=http://localhost:9090/src/ -s DEMANGLE_SUPPORT=1
	EM_CXXFLAGS += -gsource-map --source-map-base=http://localhost:9090/src/
	minify_js = no
	optimize = no
else ifeq ($(assertion),yes)
	EM_LDFLAGS += -s ASSERTIONS=1
else
	EM_LDFLAGS += -s ASSERTIONS=0
endif

ifeq ($(minify_js),yes)
	EM_LDFLAGS += --closure 1
else
	EM_LDFLAGS += --closure 0 --minify 0
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
	sse = no
	sse2 = no
	ssse3 = no
	sse41 = no
else
	sse = no
	sse2 = no
	ssse3 = no
	sse41 = no
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
