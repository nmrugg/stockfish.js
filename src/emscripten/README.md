Build

```
## Enable emscripten tools
$ source <path-to-emsdk-repo>/emsdk_env.sh

## Build
$ make -C src emscripten_build ARCH=wasm wasm_simd_post_mvp=yes
```

Run

```
## Run on NodeJS
$ /usr/bin/node -e 'console.log(`node: ${process.version}\nv8: ${process.versions.v8}`)'
node: v15.8.0
v8: 8.6.395.17-node.23

# - UCI console
$ /usr/bin/node --experimental-wasm-{simd,threads} --wasm-simd-post-mvp src/emscripten/public/uci.js

# - or programatically
$ /usr/bin/node --experimental-wasm-{simd,threads} --wasm-simd-post-mvp --experimental-repl-await
> let Stockfish = require("./src/emscripten/public/stockfish.js");
> let stockfish = await Stockfish();
> stockfish.postMessage("uci")

## Run on Browser
$ python src/emscripten/misc/server.py --d src/emscripten/public # open http://localhost:8080
```

Deploy to Vercel

```
$ yarn global add vercel
$ $(yarn global bin)/vercel deploy src/emscripten/public --prod
```

Publish npm package

```
$ npm publish --cwd src/emscripten/public
```
