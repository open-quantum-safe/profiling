#!/bin/sh

/opt/oqssa/bin/openssl speed -seconds 2 > results/speed.log 
python3 parse_openssl_speed.py results/speed.log

