#!/bin/sh

set +x

cd /opt/test
echo "Starting liboqs speed tests..."
./liboqs-test.sh
echo "Starting openssl speed tests..."
./openssl-test.sh
echo "All tests complete. Results in results folder."
