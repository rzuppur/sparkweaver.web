#!/bin/bash

mkdir -p external/emsdk

docker build -t sparkweaver_web_build .

docker run --rm -v "$(pwd):/src" -u "$(id -u):$(id -g)" sparkweaver_web_build \
  cp -r /emsdk/upstream/emscripten/system/include /src/external/emsdk/include && echo "DONE"
