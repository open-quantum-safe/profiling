#!/bin/sh


rm -rf tmp && mkdir tmp
cd tmp && git clone https://github.com/open-quantum-safe/profiling.git && cd ..
rm -rf out && mkdir out
python3 gen_website.py 2020-10-04 ${1} out
cp tmp/profiling/visualization/*.html out
cp tmp/profiling/visualization/*.js out
cp tmp/profiling/visualization/*.css out
cd out && tar czvf ../site.tgz * && cd ..
cp site.tgz ${1}/site
rm -rf tmp out

