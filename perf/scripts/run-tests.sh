#!/bin/sh

set +x

S3FOLDER=/tmp/s3dir

cd /opt/test
mkdir -p results
echo "Starting liboqs speed tests..."
./liboqs-test.sh

echo "Starting openssl speed tests..."
./openssl-test.sh

# About 1100 tests: Multiply with test runtime set by second parameter:
echo "Starting openssl handshake tests..."
python3 handshakes.py /opt/oqssa 1

echo "All tests complete. Results in results folder."
echo "Trying to mount S3..."
./mount_s3.sh ${S3FOLDER}
if [ $? -eq 0 ]; then
    echo "Copy test results to S3"
    today=`date +%Y-%m-%d-%H_%M_%S`
    tar czvf ${S3FOLDER}/${today}.tgz results/*.json
    echo "Copy complete: ${S3FOLDER}/${today}.tgz"
else
    echo "Couldn't mount S3 bucket. Not copying out test results."
fi
