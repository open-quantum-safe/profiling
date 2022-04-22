#!/bin/sh

set +x

S3FOLDER=/tmp/s3dir
# For some reason, the speed_* programs don't run when located at /opt/oqssa/bin (???)
export PATH=/Users/baentsch/profiling/liboqs/build-static/tests:/opt/oqssa/bin:$PATH
openssl version | grep Quantum

if [ $? -ne 0 ]; then
   echo "No OQS-OpenSSL in PATH $PATH. Exiting without test."
   exit 1
fi

ARCH="-m1"

echo "outputting some system information first"
uname -a
hostname

cd /opt/test
mkdir -p results
echo "Starting liboqs speed tests..."
./liboqs-test.sh

echo "Skipping liboqs memory tests (no valgrind)"

echo "Starting openssl speed tests..."
./openssl-test.sh

# About 1100 tests: Multiply with test runtime set by second parameter:
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1

# Don't do separate -ref and -noport runs as per 
# https://github.com/open-quantum-safe/liboqs/issues/1201#issuecomment-1103494938
cp results/speed_kem.json results/speed_kem-ref.json
cp results/speed_sig.json results/speed_sig-ref.json
cp results/speed.json results/speed-ref.json
cp results/handshakes.json results/handshakes-ref.json

cp results/speed_kem.json results/speed_kem-noport.json
cp results/speed_sig.json results/speed_sig-noport.json
cp results/speed.json results/speed-noport.json
cp results/handshakes.json results/handshakes-noport.json


mkdir -p ${S3FOLDER}
python3 gets3files.py 10 s3://oqs-tests ${S3FOLDER} 
if [ $? -eq 0 ]; then
    echo "Copy test results to S3"
    today=`date +%Y-%m-%d-%H_%M_%S`
    tar czvf ${S3FOLDER}/${today}${ARCH}.tgz results/*.json
    s3cmd put ${S3FOLDER}/${today}${ARCH}.tgz s3://oqs-tests
    ./gen_website.sh ${S3FOLDER} ${ARCH}
    echo "Copy complete: ${S3FOLDER}/${today}${ARCH}.tgz"
    s3cmd put /tmp/s3dir/site/site-combined.tgz s3://oqs-tests/site/site-combined-m1.tgz
else
    echo "Couldn't mount S3 bucket. Not copying out test results."
fi
