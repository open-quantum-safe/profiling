#!/bin/sh

set +x

S3FOLDER=/tmp/s3dir

echo "outputting some system information first"
dmesg
hostname

cd /opt/test
mkdir -p results
echo "Starting liboqs speed tests..."
./liboqs-test.sh

echo "Starting openssl speed tests..."
./openssl-test.sh

# About 1100 tests: Multiply with test runtime set by second parameter:
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1

echo "Starting ref tests..."
./liboqs-test.sh -ref
echo "Exchanging oqs lib..."
cp /opt/oqssa/oqs-ref/lib/liboqs.so.0.4.0 /opt/oqssa/lib/liboqs.so.0.4.0
echo "Done."
echo "Starting openssl speed tests (ref)..."
./openssl-test.sh -ref

# About 1100 tests: Multiply with test runtime set by second parameter:
# Save away previous test results
mv results/handshakes.json results/handshakes.json-fast
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1
# correct filenames again:
mv results/handshakes.json results/handshakes-ref.json
mv results/handshakes.json-fast results/handshakes.json

echo "All tests complete. Results in results folder."
echo "Trying to mount S3..."
./mount_s3.sh ${S3FOLDER}
if [ $? -eq 0 ]; then
    echo "Copy test results to S3"
    today=`date +%Y-%m-%d-%H_%M_%S`
    tar czvf ${S3FOLDER}/${today}.tgz results/*.json
    ./gen_website.sh ${S3FOLDER}
    echo "Copy complete: ${S3FOLDER}/${today}.tgz"
else
    echo "Couldn't mount S3 bucket. Not copying out test results."
fi
