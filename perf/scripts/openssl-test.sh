#!/bin/sh

/opt/oqssa/bin/openssl speed -signature-algorithms -seconds 2 > results/speed${1}.log 
/opt/oqssa/bin/openssl speed -kem-algorithms -seconds 2 | grep -v ":" >> results/speed${1}.log 
python3 parse_openssl_speed.py results/speed${1}.log

