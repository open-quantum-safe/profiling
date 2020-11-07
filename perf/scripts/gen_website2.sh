#!/bin/sh


rm -rf tmp && mkdir tmp
cd tmp && git clone https://github.com/open-quantum-safe/speed.git && cd ..
rm -rf out && mkdir out && mkdir out/latest
python3 collate_json.py 2020-10-10 ${1} out/latest
cp tmp/speed/visualization/*.html out
cp tmp/speed/visualization/*.js out
cp tmp/speed/visualization/*.css out
cd out && tar czvf ../site2.tgz * && cd ..
cp site2.tgz ${1}/site
rm -rf tmp out

