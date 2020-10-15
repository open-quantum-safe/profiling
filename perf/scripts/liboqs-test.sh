#!/bin/sh

set +x

/opt/oqssa/bin/speed_kem${1} | tee results/speed_kem${1}.log
/opt/oqssa/bin/speed_sig${1} | tee results/speed_sig${1}.log
echo "Generating logfiles..."
python3 parse_liboqs_speed.py results/speed_sig${1}.log
python3 parse_liboqs_speed.py results/speed_kem${1}.log
echo "liboqs testing complete."

