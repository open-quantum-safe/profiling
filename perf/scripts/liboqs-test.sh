#!/bin/sh

set +x

/opt/oqssa/bin/speed_kem | tee results/speed_kem.log
/opt/oqssa/bin/speed_sig | tee results/speed_sig.log
echo "Generating logfiles..."
python3 parse_liboqs_speed.py results/speed_sig.log
python3 parse_liboqs_speed.py results/speed_kem.log
echo "liboqs testing complete."

