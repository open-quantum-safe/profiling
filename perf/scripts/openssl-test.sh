#!/bin/sh

mkdir -p results
/opt/oqssa/bin/openssl speed -seconds 2 > results/speed.log 2> results/speed.err
python3 parse_openssl_speed.py results/speed.log

