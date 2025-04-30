FROM emscripten/emsdk:latest

RUN echo "## Installing npm dependencies" \
    && cd ${EMSDK} && . ./emsdk_env.sh \
    && cd ${EMSDK}/upstream/emscripten\
    && npm ci \
    && echo "## Done"
