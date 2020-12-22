#!/bin/sh

if [ $# -ne 1 ]; then
   echo "Usage: $0 <datafolder>. Exiting."
   exit 1
fi

rm -rf tmp && mkdir tmp
cd tmp && git clone https://github.com/open-quantum-safe/profiling.git && cd ..
rm -rf out && mkdir out
python3 gen_website.py 2020-10-04 ${1} out
cp tmp/profiling/visualization/*.html out
cp tmp/profiling/visualization/*.js out
cp tmp/profiling/visualization/*.css out
cd out && tar czvf ../site.tgz * && cd ..
cp site.tgz ${1}/site

# perform deviation test and reporting

# obtain the last deviation report
cp $1/devs.txt .
# create new deviations report
python3 devcheck.py out devs.txt > newdevs.txt
# discard cycle counting deviations assuming they're caused by swapping
egrep -v "insts|cycles" newdevs.txt > report.txt
# send email
python3 notify.py report.txt
# store todays deviation for comparison tomorrow
cp newdevs.txt $1/devs.txt

# cleanup
rm -rf tmp out report.txt *devs.txt

