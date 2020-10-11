#!/bin/sh


rm -rf tmp && mkdir tmp
cd tmp && git clone https://github.com/open-quantum-safe/speed.git && cd ..
rm -rf out && mkdir out
python3 gen_website.py 2020-10-04 ${1} out
cp tmp/speed/visualization/*.html out
cp tmp/speed/visualization/*.js out
cp tmp/speed/visualization/*.css out
cd out && tar czvf ../site.tgz * && cd ..
cp site.tgz ${1}
rm -rf tmp out

