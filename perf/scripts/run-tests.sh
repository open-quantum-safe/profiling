#!/bin/sh

set +x

S3FOLDER=/tmp/s3dir

ARCH=-`uname -m`

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

echo "Starting ref tests..."
./liboqs-test.sh -ref
echo "Exchanging oqs lib..."
cp /opt/oqssa/oqs-ref/lib/liboqs.so.0.* /opt/oqssa/lib/
if [ $? -ne 0 ]; then
   # if cp failed liboqs version count moved beyond 0.x. Terminate right here
   echo "Check liboqs version number: Could not copy /opt/oqssa/oqs-ref/lib/liboqs.so.0.*"
   ls /opt/oqssa/oqs-ref/lib/
   exit 1
fi

echo "Done."
echo "Starting openssl speed tests (ref)..."
./openssl-test.sh -ref

echo "Starting liboqs memory tests..."
python3 run_mem.py test_kem_mem-ref && mv test_kem_mem-ref.json results/mem_kem-ref.json
python3 run_mem.py test_sig_mem-ref && mv test_sig_mem-ref.json results/mem_sig-ref.json

# About 1100 tests: Multiply with test runtime set by second parameter:
# Save away previous test results
mv results/handshakes.json results/handshakes.json-port
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1
# correct filenames again:
mv results/handshakes.json results/handshakes-ref.json

echo "Starting nonportable tests..."
./liboqs-test.sh -noport
echo "Exchanging oqs lib..."
cp /opt/oqssa/oqs-noport/lib/liboqs.so.0.* /opt/oqssa/lib/
# Don't repeat version check here: It would have failed with -ref already
echo "Done."
echo "Starting openssl speed tests (noport)..."
./openssl-test.sh -noport

# TBD: Re-enable once Valgrind can handle AVX512-optimized code
#echo "Starting liboqs memory tests for fast code..."
#python3 run_mem.py test_kem_mem-noport && mv test_kem_mem-noport.json results/mem_kem-noport.json
#python3 run_mem.py test_sig_mem-noport && mv test_sig_mem-noport.json results/mem_sig-noport.json

# About 1100 tests: Multiply with test runtime set by second parameter:
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1
# correct filenames again:
mv results/handshakes.json results/handshakes-noport.json

mv results/handshakes.json-port results/handshakes.json

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
