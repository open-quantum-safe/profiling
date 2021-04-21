# Performance tests

This folder contains scripts to execute (´*.sh´) various OQS performance tests and evaluate the results (´*.py´) within a Docker image. The results are stored in JSON format (´*.json´).

## Building 

To build the test image, simply execute `docker build -t oqs-perf .`.

To build for ARM64, this command works: `docker buildx build -t oqs-perf:arm64 --platform=linux/arm64 .`. It requires the [installation & activation of `docker buildx`](https://github.com/docker/buildx#installing).

## Running

To execute the tests, you may run the container with `docker run oqs-perf`. The results are generated into a folder ´/opt/test/results´. If the S3 environment variables ([see below](#s3-support)) are set, the test results are copied to an S3 bucket. 

Thus, to obtain the test results you may want to mount this folder to a permanent storage location.

## Implementation details

### Tests built

Three separate sets of test executables are built: 
- Distributable build (default): This code contains [CPU-feature guarded](https://github.com/open-quantum-safe/liboqs/wiki/Customizing-liboqs#oqs_dist_build) assembly optimizations and should run on all x86_64 CPUs.
- Reference code build ("-ref"): This code is plain C code compiled for generic x86_64 processors and will run on all CPUs of this type.
- Performance build ("-noport"): This code will run on processors of class "skylake-avx512" but may fail to execute properly on CPUs with fewer CPU optimization features.

### Local execution 

For example, in the case of a local execution `docker run -v /home/tests:/opt/test/results oqs-perf` will turn up the test results in the local ´/home/tests´ folder.

### S3 support

In order to store the results in AWS S3, the following environment variables have to be set for the script `mount_s3.sh` to operate correctly:
- BUCKETNAME: Name of bucket where to store results. Follow [AWS guidance](https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html).
- BUCKETSECRETS: Colon-separated pair of AWS Access Key ID:Secret Access Key. Guidance on creating and using these [available for example here](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html).

### High-performance building

In order to speed up the building of all components, the Dockerfile build argument `MAKE_DEFINES` is available and should be set to a value commensurate to the build platform at hand: If you have a 48 core machine, you may thus want to run the ARM64 cross-build command for example like this: `docker buildx build --build-arg MAKE_DEFINES="-j 48" -t oqs-perf:arm64 --platform=linux/arm64 .`.

Default value for `MAKE_DEFINES` is "-j 2" to assure successful docker image generation also on more simple hardware.

### Running scheduled task

#### AWS

In order to execute the container image within AWS as a regular task, follow these steps:
- [Create an ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create_cluster.html)
- [Create a scheduled task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/scheduled_tasks.html) within this cluster: A suitable task definition is available [here](aws/task.json): Be sure to correctly set image location (default `openquantumsafe/oqs-perf`) and BUCKETNAME (default `oqs-results`) and BUCKETSECRETS (default key ID `AAA...AAA` and secret: `BBB...BBB`).
