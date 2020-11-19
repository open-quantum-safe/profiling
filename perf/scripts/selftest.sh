#!/bin/sh

openssl version | grep "Open Quantum Safe"

if [ $? != 0 ]; then
   echo "OQS OpenSSL not found. Test failure."
   exit 1
fi

./mount_s3.sh /tmp/test | grep "expects BUCKETSECRETS"

if [ $? != 0 ]; then
   echo "mount harness failing. Test failure."
   exit 1
fi

s3fs 2>&1 | grep "s3fs: missing BUCKET argument."

if [ $? != 0 ]; then
   echo "s3fs failing. Test failure."
   exit 1
fi

echo "Selftests passed."
