# Performance tests

This folder contains scripts to execute (´*.sh´) various OQS performance tests and evaluate the results (´*.py´) within a Docker image. The results are stored in JSON format (´*.json´).

## Building 

To build the test image, simply execute ´docker build -t oqs-perf´.

## Running

To execute the tests, you may run the container with ´docker run oqs-perf´. The results are generated into a folder ´/opt/test/results´.

Thus, to obtain the test results you may want to mount this folder to a permanent storage location.

In the case of a local execution this might look like ´docker run -v /home/tests:/opt/test/results oqs-perf´ to find the test results in the local ´/home/tests´ folder.


