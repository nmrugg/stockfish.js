# Override base settings
EXE = stockfish.js
COMP = em++
CXX = em++
comp = clang
arch = wasm
bits = 64
SUPPORTED_ARCH=true

ifeq ($(ASMJS),yes)
	EM_LDFLAGS  += -s WASM=0
	popcnt = no
	sse = no
	sse2 = no
	ssse3 = no
	sse41 = no
else
	EM_CXXFLAGS += -msimd128
	# CPU settings
	popcnt = yes
	sse = yes
	sse2 = yes
	ssse3 = yes
	sse41 = yes
endif


# Compiler flags
#EM_CXXFLAGS += -DUSE_POPCNT
EM_CXXFLAGS += -DPOSIXALIGNEDALLOC

ifeq ($(WASM_DEBUG),yes)
	#EM_CXXFLAGS += -g3 -gsource-map --source-map-base=src/ -s SAFE_HEAP=1 -s ASSERTIONS=1
	#EM_LDFLAGS  += -g3 -gsource-map --source-map-base=src/ -s SAFE_HEAP=1 -s ASSERTIONS=1
	EM_CXXFLAGS += -g3 -s ASSERTIONS=1
	EM_LDFLAGS  += -g3 -s ASSERTIONS=1
	ifneq ($(ASMJS),yes)
		EM_CXXFLAGS += -gsource-map --source-map-base=/src/ 
		EM_LDFLAGS  += -gsource-map --source-map-base=/src/ 
	endif
	optimize = no
	# -fsanitize=undefined is currently breaking the large build
	#EM_CXXFLAGS  += -fsanitize=undefined
	#EM_LDFLAGS  += -fsanitize=undefined
	ifneq ($(WASM_SINGLE_THREADED),yes)
		EM_CXXFLAGS += -pthread
		EM_LDFLAGS  += -pthread
	endif
	EM_LDFLAGS += --minify=0
else
	ifneq ($(NOJSMINIFY),yes)
		EM_LDFLAGS  += --closure 1
	else
		EM_LDFLAGS += --minify=0
	endif
endif


# Enable sanatizers https://emscripten.org/docs/debugging/Sanitizers.html
#EM_CXXFLAGS  += -fsanitize=undefined
#EM_LDFLAGS  += -fsanitize=undefined
#EM_CXXFLAGS  += -fsanitize=address
#EM_LDFLAGS  += -fsanitize=address


# Linker flags
EM_LDFLAGS  += --pre-js emscripten/pre.js

ifeq ($(LITE_NET),yes)
	EM_LDFLAGS  += --extern-pre-js emscripten/credits-lite.js
else
	EM_LDFLAGS  += --extern-pre-js emscripten/credits.js
endif

#EM_LDFLAGS  += -s INITIAL_MEMORY=536870912
EM_LDFLAGS  += -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=134217728 -s MAXIMUM_MEMORY=2147483648 -Wno-pthreads-mem-growth
# Ignore irrelevant warning
EM_CXXFLAGS += -Wno-pthreads-mem-growth
EM_LDFLAGS  += -s ENVIRONMENT=web,worker,node
EM_LDFLAGS  += -s EXIT_RUNTIME=0
EM_LDFLAGS  += -s MODULARIZE=1
EM_LDFLAGS  += -s EXPORT_NAME="Stockfish"
#EM_LDFLAGS  += -s NO_FILESYSTEM=1
#EM_LDFLAGS  += -s EXPORTED_FUNCTIONS="['_main','_command']"

EM_LDFLAGS  += -s EXPORTED_RUNTIME_METHODS=ccall
#NOTE: Setting INCOMING_MODULE_JS_API *replaces* the default list (it does not
#extend it). `wasmBinary` was removed from the defaults in emscripten 6.0.2 and
#the Node.js loader supplies it for split builds, so we must re-list the other
#incoming APIs the JS glue relies on (locateFile, print/printErr,
#instantiateWasm) alongside it. Omitting any of them is a hard error in
#ASSERTIONS builds and silently breaks the module (e.g. pthread workers) in
#release builds.
#
#NOTE: We also list the incoming APIs that the build relies on:
#  - wasmMemory : the pthread workers share the main thread's
#    WebAssembly.Memory; keeping this in the incoming API lets the runtime
#    recognize a (re)grown / transferred memory buffer across the thread
#    boundary instead of treating it as opaque.
#  - mainScriptUrlOrBlob : pthread workers re-load the main script; exposing
#    this hook keeps worker-script resolution robust.
#  - onExit : lets the host react to a proxied-main-thread exit.
#NOTE: `buffer` was listed here too, but Emscripten 6.x no longer accepts it
#(it warns "invalid entry in INCOMING_MODULE_JS_API: buffer"), so it was removed.
EM_LDFLAGS  += -s INCOMING_MODULE_JS_API=wasmBinary,locateFile,print,printErr,instantiateWasm,wasmMemory,mainScriptUrlOrBlob,onExit

ifeq ($(WASM_SINGLE_THREADED),yes)
	EM_CXXFLAGS += -D__EMSCRIPTEN_SINGLE_THREADED__
	#EM_LDFLAGS  += --extern-post-js emscripten/extern-post-single.js
	#EM_LDFLAGS += -s EXPORTED_FUNCTIONS="['_stop', '_ponderhit', '_main']"
	# Add a second pre-js file.
	#EM_LDFLAGS  += --pre-js emscripten/pre-single-threaded.js
	EM_LDFLAGS  += -s ASYNCIFY=1
	EM_LDFLAGS  += -s ASYNCIFY_STACK_SIZE=10485760
	#NOTE: Single-threaded uses the on-demand command() ccall (process_command),
	#NOT the glue queue / loop() design (there is no (proxy) main thread). So
	#glue.cpp is not needed and _command (not _uci) is exported.
	EM_LDFLAGS  += -s EXPORTED_FUNCTIONS="['_main','_command','_isSearching']"
	#NOTE: Single-threaded runs the whole search on the main thread (inside the
	#command() ccall), so the main stack IS the search stack. The default 64 KB
	#is far too small for deep searches (the pthread builds give search threads
	#2 MB in NDEBUG / 8 MB in debug), and it is what triggered the
	#"Stack overflow detected" linker warning under --debug-wasm (debug frames
	#are deeper; release -O3 frames simply did not trip the heuristic). 4 MB
	#matches the native per-thread stacks. The multithreaded proxy-main only
	#runs the shallow UCI loop, so it keeps the default stack size.
	EM_LDFLAGS  += -sSTACK_SIZE=4194304
else
	#NOTE: The UCI loop runs on the (proxy) main thread and pulls commands from
	#the glue queue (glue.cpp). _uci pushes a command onto that queue.
	SRCS += glue.cpp
	EM_LDFLAGS  += -s EXPORTED_FUNCTIONS="['_main','_uci','_isReady','_isSearching']"
	#EM_LDFLAGS  += --extern-post-js emscripten/extern-post.js
	EM_LDFLAGS  += -s PROXY_TO_PTHREAD
	#NOTE: -sSTRICT enables the strict runtime path, and
	#-sALLOW_BLOCKING_ON_MAIN_THREAD=0 keeps the host main thread from
	#ever doing a synchronous (event-loop-stalling) block while it shuttles
	#proxied work (thread spawns, futex/mailbox traffic) for the search threads.
	EM_LDFLAGS  += -s STRICT
	EM_LDFLAGS  += -s ALLOW_BLOCKING_ON_MAIN_THREAD=0
	EM_CXXFLAGS += -pthread
	EM_LDFLAGS  += -pthread
endif

# The build vars (IS_ASYNCIFY / enginePartsCount / isASMEngine / engineTotalBytes)
# are written to emscripten/build-flags.js by build.js (before make runs) and
# spliced into the IIFE scope between extern-pre.js (opens the IIFE) and
# extern-pre2.js (declares Stockfish + opens INIT_ENGINE). They are assigned real
# 0/1/N values so the link-time Closure compiler folds the branch checks in
# extern-post.js correctly. engineTotalBytes is left bare; build.js fills it in
# post-link (the wasm size is unknown until after linking).
BUILD_FLAGS_JS = emscripten/build-flags.js

EM_LDFLAGS  += --extern-pre-js emscripten/extern-pre.js
EM_LDFLAGS  += --extern-pre-js $(BUILD_FLAGS_JS)
EM_LDFLAGS  += --extern-pre-js emscripten/extern-pre2.js
EM_LDFLAGS  += --extern-post-js emscripten/extern-post.js

#NOTE: The "Stack overflow detected (currently set to 65536)" linker warning
#from --debug-wasm single-threaded builds is handled in the
#WASM_SINGLE_THREADED branch above (-sSTACK_SIZE=4194304). Do NOT set a small
#global STACK_SIZE here: in single-threaded builds the main stack is the
#search stack, and in multithreaded builds the proxy-main only needs the
#default size.

#EM_CXXFLAGS  += -s PTHREAD_POOL_SIZE=5
#EM_LDFLAGS  += -s PTHREAD_POOL_SIZE=5
#EM_CXXFLAGS  += -s PTHREAD_POOL_SIZE_STRICT=2
#EM_LDFLAGS  += -s PTHREAD_POOL_SIZE_STRICT=2

#EM_LDFLAGS  += -s ASYNCIFY=1
#EM_LDFLAGS  += -s 'ASYNCIFY_IMPORTS=["emscripten_utils_getline_impl"]'


EXTRACXXFLAGS += $(EM_CXXFLAGS)
EXTRALDFLAGS += $(EM_LDFLAGS)
