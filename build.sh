set -e
make -C src build ARCH=js -j `node -e "process.stdout.write(String(require('os').cpus().length))"` && cat src/pre.js src/stockfish.js src/post.js > src/stockfish-make-tmp.js && mv src/stockfish-make-tmp.js src/stockfish.js
