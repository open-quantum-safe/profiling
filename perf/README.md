# Performance tests

This folder contains scripts to execute (´*.sh´) various OQS performance tests and evaluate the results (´*.py´) within a Docker image. The results are stored in JSON format (´*.json´).

## Building 

To build the test image, simply execute `docker build -t oqs-perf .`

## Running

To execute the tests, you may run the container with `docker run oqs-perf`. The results are generated into a folder ´/opt/test/results´. If the S3 environment variables ([see below](#s3-support)) are set, the test results are copied to an S3 bucket. 

Thus, to obtain the test results you may want to mount this folder to a permanent storage location.

## Implementation details

### Local execution 

For example, in the case of a local execution `docker run -v /home/tests:/opt/test/results oqs-perf` will turn up the test results in the local ´/home/tests´ folder.

### S3 support

In order to store the results in AWS S3, the following environment variables have to be set for the script `mount_s3.sh` to operate correctly:
- BUCKETNAME: Name of bucket where to store results. Follow [AWS guidance](https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html).
- BUCKETSECRETS: Colon-separated pair of AWS Access Key ID:Secret Access Key. Guidance on creating and using these [available for example here](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html).

### Running scheduled task

#### AWS

In order to execute the container image within AWS as a regular task, follow these steps:
- [Create an ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create_cluster.html)
- [Create a scheduled task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/scheduled_tasks.html) within this cluster: A suitable task definition is available [here](aws/task.json): Be sure to correctly set image location (default `openquantumsafe/oqs-perf`) and BUCKETNAME (default `oqs-results`) and BUCKETSECRETS (default key ID `AAA...AAA` and secret: `BBB...BBB`).
