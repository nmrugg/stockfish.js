set -e
make -C src build ARCH=js syzygy=no -j `node -e "process.stdout.write(String(require('os').cpus().length))"`
