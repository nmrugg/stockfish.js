set -o errexit -o pipefail -o nounset

cd src
make clean
make ARCH=wasm build -j
cd .. 
cat preamble.js src/stockfish.js > stockfish.js
cp src/stockfish.worker.js src/stockfish.wasm .
