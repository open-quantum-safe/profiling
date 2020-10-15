#!/bin/sh

/opt/oqssa/bin/openssl speed -seconds 2 > results/speed${1}.log 
python3 parse_openssl_speed.py results/speed${1}.log

