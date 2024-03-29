import subprocess
import os
import time
import json
import sys
import re

# List of classic KEM algs to test
CLASSIC_KEM_LIST="secp256r1,secp384r1,X25519,X448"

# List of classic SIG algs to test
CLASSIC_SIG_LIST="ED448,ED25519,RSA:2048,RSA:3072,ECDSAprime256v1,ECDSAsecp384r1"

# Default install directory
INSTALLDIR="/opt/oqssa"

# Time in seconds to run test
TEST_TIME="1"

# will contain results
data={}

def do_cert(sig):
    data[sig]={}
    # Generate CA and server certs:
    # Special handling for ECDSA algs required
    if sig.startswith("ECDSA"):
        s_spec = "ec -pkeyopt ec_paramgen_curve:"+sig[5:] # cutting off leading ECDSA moniker to get curve name
    else:
        s_spec = sig
    if os.system("openssl req -x509 -new -newkey "+s_spec+" -keyout CA.key -out CA.crt -nodes -subj \"/CN=oqstest CA\" -days 365 -config "+INSTALLDIR+"/ssl/openssl.cnf")!=0:
       print("Couldn't generate CA")
    if os.system("openssl req -new -newkey "+s_spec+" -keyout /opt/test/server.key -out /opt/test/server.csr -nodes -subj \"/CN=localhost\"")!=0:
       print("Couldn't generate CSR")
    if os.system("openssl x509 -req -in /opt/test/server.csr -out /opt/test/server.crt -CA CA.crt -CAkey CA.key -CAcreateserial -days 365")!=0:
       print("Couldn't generate server cert")

def do_kem(kem, sig):
        print("Doing KEM %s" % (kem)) 
        # run test:
        # start server:
        server = subprocess.Popen(["openssl", "s_server", "-cert", "/opt/test/server.crt", "-key", "/opt/test/server.key", "-curves", kem, "-www", "-tls1_3", "-accept", "localhost:4433"])
        if server is None:
           print("Couldn' start server for %s/%s" % (sig/kem))
        else:
           # Give server time to come up
           time.sleep(1)
           # Run tests for some time
           # KEM to be set via env var DEFAULT_GROUPS (see openssl.cnf)
           new_env = os.environ.copy()
           new_env["DEFAULT_GROUPS"]=kem
           client = subprocess.Popen(["openssl", "s_time", "-connect", ":4433", "-new", "-time", TEST_TIME, "-verify", "1"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=new_env)
           client_stdout_iterator = iter(client.stdout.readline, b"")
           for line in client_stdout_iterator:
              l = str(line.rstrip())[2:-1]
              try:
                 idx=l.index("connections/user sec")
                 if idx>0: # result found
                    r=l.rfind(" ",0,idx-2) 
                    val=float(l[r+1:idx-1])
                    data[sig][kem]=val
              except ValueError:
                 pass
           server.terminate()

def populate_algs():
   # first get QS sig algs:
   process = subprocess.Popen(["openssl", "list", "-signature-algorithms"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
   stdout_iterator = iter(process.stdout.readline, b"")
   stderr_iterator = iter(process.stderr.readline, b"")
   sigs=[]

   for line in stdout_iterator:
       l = str(line.rstrip())[2:-1]
       if l.endswith(" @ oqsprovider"):
          sigs.append(l[2:-14]) 

   # then get QS KEM algs:
   process = subprocess.Popen(["openssl", "list", "-kem-algorithms"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
   stdout_iterator = iter(process.stdout.readline, b"")
   stderr_iterator = iter(process.stderr.readline, b"")
   kems=[]
   for line in stdout_iterator:
       l = str(line.rstrip())[2:-1]
       if l.endswith(" @ oqsprovider"):
          kems.append(l[2:-14]) 

   if len(kems)==0 or len(sigs)==0:
      print("Didn't find quantumsafe KEM or SIG list. Exiting.")
      exit(1)
   # Now add classic algs, too:
   kems.extend(CLASSIC_KEM_LIST.split(","))
   sigs.extend(CLASSIC_SIG_LIST.split(","))
   return kems,sigs

kems,sigs=populate_algs()
print("Baseline KEMs:")
print(kems)
print("Baseline SIGs:")
print(sigs)
# Limit testing as per https://github.com/open-quantum-safe/profiling/issues/83#issuecomment-1345546025
kems = ['kyber512', 'kyber768', 'kyber1024', 'p256_kyber512', 'p384_kyber768', 'p521_kyber1024', 'secp256r1', 'secp384r1', 'X25519', 'X448']
sigs = ['dilithium2', 'p256_dilithium2', 'rsa3072_dilithium2', 'dilithium3', 'p384_dilithium3', 'dilithium5', 'p521_dilithium5', 'falcon512', 'p256_falcon512', 'rsa3072_falcon512', 'falcon1024', 'p521_falcon1024', 'sphincsharaka128fsimple', 'p256_sphincsharaka128fsimple', 'rsa3072_sphincsharaka128fsimple', 'sphincssha256128ssimple', 'p256_sphincssha256128ssimple', 'rsa3072_sphincssha256128ssimple', 'sphincsshake256128fsimple', 'p256_sphincsshake256128fsimple', 'rsa3072_sphincsshake256128fsimple', 'ED448', 'ED25519', 'RSA:2048', 'RSA:3072', 'ECDSAprime256v1', 'ECDSAsecp384r1', 'ECDSAsecp521r1']
# Limit testing as per https://github.com/open-quantum-safe/profiling/issues/93#issuecomment-1611818545
# Deactivate the following two variables when interested in more than "NCCoE"
sigs_levels = [ ['dilithium2', 'p256_dilithium2', 'falcon512', 'p256_falcon512', 'sphincssha2128ssimple', 'p256_sphincssha2128ssimple', 'sphincsshake128fsimple', 'p256_sphincsshake128fsimple', 'ED25519', 'ECDSAprime256v1'],
                ['dilithium3', 'p384_dilithium3', 'ED448', 'ECDSAsecp384r1'],
                ['dilithium5', 'p521_dilithium5', 'falcon1024', 'p521_falcon1024', 'ECDSAsecp521r1']
              ]
kems_levels=[ [ 'kyber512', 'p256_kyber512', 'secp256r1', 'X25519'],
              [ 'kyber768', 'p384_kyber768', 'secp384r1', 'X448'],
              [ 'kyber1024', 'p521_kyber1024']
            ]

if len(sys.argv)>1:
   # pass in installdir
   INSTALLDIR=sys.argv[1]
if len(sys.argv)>2:
   # pass in test_time
   TEST_TIME=sys.argv[2]

if 'sigs_levels' in locals():
  for i in range(len(sigs_levels)):
    for sig in sigs_levels[i]:
       do_cert(sig)
       for kem in kems_levels[i]:
          do_kem(kem, sig)
else:
  for sig in sigs:
    do_cert(sig)
    for kem in kems:
        do_kem(kem, sig)

# Dump data
with open("results/handshakes.json", 'w') as outfile:
    json.dump(data, outfile)

