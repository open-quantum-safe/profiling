#!/bin/sh

if [ $# -ne 2 ]; then
   echo "Usage: $0 <datafolder> arch. Exiting."
   exit 1
fi

rm -rf tmp && mkdir tmp
cd tmp && git clone https://github.com/open-quantum-safe/profiling.git && cd ..
rm -rf out && mkdir out

# To be removed when combiner works well:
python3 gen_website.py 2021-03-25 ${1} out ${2}
cp tmp/profiling/visualization/*.html out
cp tmp/profiling/visualization/*.js out
cp tmp/profiling/visualization/*.css out
cd out && tar czvf ../site${2}.tgz * && cd ..
cp site${2}.tgz ${1}/site

# generate combined JSON and HTML:
mkdir out2
python3 combine.py 10 ${1} out2
if [ $? -eq 0 ]; then
  cp tmp/profiling/visualization/*.html out2
  cp tmp/profiling/visualization/*.js out2
  cp tmp/profiling/visualization/*.css out2
  cd out2 && tar czvf ../site-combined.tgz * && cd ..
  cp site-combined.tgz ${1}/site
fi
# perform deviation test and reporting

# obtain the last deviation report (arch-dependent)
cp $1/devs.txt$2 .
# create new deviations report
python3 devcheck.py out devs.txt$2 > newdevs.txt$2
# output architecture in report file:
echo "Deviations for architecture: $2" > report.txt
# discard cycle counting deviations assuming they're caused by swapping
egrep -v "insts|cycles" newdevs.txt$2 >> report.txt
# store todays deviation for comparison tomorrow
cp newdevs.txt$2 $1/devs.txt$2
# send email
python3 notify.py report.txt

# cleanup
rm -rf tmp out* report.txt *devs.txt*

