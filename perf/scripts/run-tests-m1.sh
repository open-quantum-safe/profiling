#!/bin/sh

set +x

S3FOLDER=/tmp/s3dir

#ARCH=-`uname -m`
ARCH="-m1"

echo "outputting some system information first"
cat /etc/os-release
uname -a
hostname

cd /opt/test
mkdir -p results
echo "Starting liboqs speed tests..."
./liboqs-test.sh

echo "Starting liboqs memory tests..."
python3 run_mem.py test_kem_mem && mv test_kem_mem.json results/mem_kem.json
python3 run_mem.py test_sig_mem && mv test_sig_mem.json results/mem_sig.json

echo "Starting openssl speed tests..."
./openssl-test.sh

# About 1100 tests: Multiply with test runtime set by second parameter:
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1

# replicate data for other result types for visualization completeness:

cp results/speed_kem.json results/speed_kem-noport.json
cp results/speed_sig.json results/speed_sig-noport.json
cp results/speed.json results/speed-noport.json
cp results/handshakes.json results/handshakes-noport.json
cp results/speed_kem.json results/speed_kem-ref.json
cp results/speed_sig.json results/speed_sig-ref.json
cp results/speed.json results/speed-ref.json
cp results/handshakes.json results/handshakes-ref.json


echo "All tests complete. Results in results folder."
echo "Trying to mount S3..."
./mount_s3.sh ${S3FOLDER}
if [ $? -eq 0 ]; then
    echo "Copy test results to S3"
    today=`date +%Y-%m-%d-%H_%M_%S`
    tar czvf ${S3FOLDER}/${today}${ARCH}.tgz results/*.json
    ./gen_website.sh ${S3FOLDER} ${ARCH}
    echo "Copy complete: ${S3FOLDER}/${today}${ARCH}.tgz"
else
    echo "Couldn't mount S3 bucket. Not copying out test results."
fi
