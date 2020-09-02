#!/bin/sh

mkdir -p results
/opt/oqssa/bin/speed_kem > results/speed_kem.log
/opt/oqssa/bin/speed_sig > results/speed_sig.log
python3 parse_liboqs_speed.py results/speed_sig.log
python3 parse_liboqs_speed.py results/speed_kem.log

