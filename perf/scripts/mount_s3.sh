#!/bin/sh

# Script to mount an S3 bucket using s3fs

# Expect BUCKETNAME and BUCKETSECRETS as environment variables:

LOCALBUCKETPATH=$1
if [ -z "${LOCALBUCKETPATH}" ]; then
   echo "$0 expects local mount path for S3 bucket. Exiting without such path set."
   exit 1
fi

if [ -z "${BUCKETSECRETS}" ]; then
   echo "$0 expects BUCKETSECRETS to authenticate to S3. Exiting without mount."
   exit 1
fi

if [ -z "${BUCKETNAME}" ]; then
   echo "$0 expects BUCKETNAME as environment variable. Exiting without mount."
   exit 1
else
   echo "${BUCKETSECRETS}" > ~/.passwd-s3fs
   chmod 600 ~/.passwd-s3fs
   mkdir -p ${LOCALBUCKETPATH}
   s3fs ${BUCKETNAME} ${LOCALBUCKETPATH}
   if [ $? -eq 0 ]; then
      echo "$BUCKETNAME mounted"
   else
      echo "Mount failed"
      exit 1
   fi
fi
