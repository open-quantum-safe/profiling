#!/bin/sh

# possible params:
# $1: Name of test (none: default, "-ref", "-perf")
# $2: Params to KEM testing (e.g., "-d 1 BIKE-L1") to speed up logic test
# $3: Params to SIG testing (e.g., "-d 1 Dilithium2") to speed up logic test

# Disable if not interested in execution log output:
set +x

/opt/oqssa/bin/speed_kem${1} ${2} | tee results/speed_kem${1}.log
/opt/oqssa/bin/speed_sig${1} ${3} | tee results/speed_sig${1}.log
echo "Generating logfiles..."
python3 parse_liboqs_speed.py results/speed_sig${1}.log
python3 parse_liboqs_speed.py results/speed_kem${1}.log
echo "liboqs testing complete."

