#!/bin/bash

mkdir -p ui/src/assets

docker build -t sparkweaver_web_build .

docker run --rm -v "$(pwd):/src" -u "$(id -u):$(id -g)" sparkweaver_web_build \
  emcc \
  src/main.cpp \
  external/sparkweaver.core/src/*.cpp \
  -Iexternal/sparkweaver.core/include \
  -Iexternal/sparkweaver.core/src \
  -o ui/src/assets/core.mjs \
  --bind \
  --emit-tsd core.d.ts \
  -sMODULARIZE=1 \
  -sEXPORT_ES6=1 \
  -sENVIRONMENT=web \
  -fexceptions \
  -sDISABLE_EXCEPTION_CATCHING=0 \
  -std=c++20 \
  -O3 \
  && echo "DONE"