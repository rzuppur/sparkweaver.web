# !!!
# THIS FILE IS NOT USED FOR BUILDING
# SEE README.md FOR MORE INFO
# !!!
cmake_minimum_required(VERSION 3.31)
project(sparkweaver_web)
set(CMAKE_CXX_STANDARD 20)
add_subdirectory(external/sparkweaver.core)
add_executable(sparkweaver_web src/main.cpp)
target_link_libraries(sparkweaver_web PRIVATE sparkweaver_core)
target_include_directories(sparkweaver_web PRIVATE external/sparkweaver.core/src)
target_include_directories(sparkweaver_web PRIVATE external/emsdk/include)
