#!/bin/sh

if [ $# -ne 2 ]; then
   echo "Usage: $0 <datafolder> arch. Exiting."
   exit 1
fi

rm -rf tmp && mkdir tmp
cd tmp && git clone https://github.com/open-quantum-safe/profiling.git && cd ..
rm -rf out && mkdir out

# generate combined JSON and HTML:
python3 combine.py 10 ${1} out
if [ $? -eq 0 ]; then
  cp tmp/profiling/visualization/*.html out
  cp tmp/profiling/visualization/*.js out
  cp tmp/profiling/visualization/*.css out
  cd out && tar czvf ../site-combined.tgz * && cd ..
  cp site-combined.tgz ${1}/site
fi
# perform deviation test and reporting

# obtain the last deviation report (arch-dependent)
cp $1/devs.txt$2 .
# create new deviations report
python3 devcheck.py $1 $2 devs.txt$2 > newdevs.txt$2 2>/dev/null
# output architecture in report file:
echo "Deviations for architecture: $2" > report.txt
# discard cycle counting deviations assuming they're caused by swapping
egrep -v "insts|cycles" newdevs.txt$2 >> report.txt
# store todays deviation for comparison tomorrow
cp newdevs.txt$2 $1/devs.txt$2
# send email
python3 notify.py report.txt

# cleanup
rm -rf tmp out report.txt *devs.txt*

