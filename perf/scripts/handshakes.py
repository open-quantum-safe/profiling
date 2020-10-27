import subprocess
import os
import time
import json
import sys
import re

# Default install directory
INSTALLDIR="/opt/oqssa"

# Time in seconds to run test
TEST_TIME="1"

# will contain results
data={}

def populate_algs():
   process = subprocess.Popen(["openssl", "speed", "test"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
   stdout_iterator = iter(process.stdout.readline, b"")
   stderr_iterator = iter(process.stderr.readline, b"")
   kems=[]
   sigs=[]

   for line in stderr_iterator:
       l = str(line.rstrip())[2:-1]
       if l.startswith("OQSSIG"):
          alglist=re.sub(r"^\W+|\W+$", "", l[16:]) # cut trailing non-alphanumerics
          sigs=alglist.split(",")
       if l.startswith("OQSKEM"):
          alglist=re.sub(r"^\W+|\W+$", "", l[16:]) # cut trailing non-alphanumerics
          kems=alglist.split(",")

   if len(kems)==0 or len(sigs)==0:
      print("Didn't find KEM or SIG list. Exiting.")
      exit(1)
   return kems,sigs

kems,sigs=populate_algs()

if len(sys.argv)>1:
   # pass in installdir
   INSTALLDIR=sys.argv[1]
if len(sys.argv)>2:
   # pass in test_time
   TEST_TIME=sys.argv[2]

for sig in sigs:
    data[sig]={}
    # Generate CA and server certs:
    if os.system("openssl req -x509 -new -newkey "+sig+" -keyout CA.key -out CA.crt -nodes -subj \"/CN=oqstest CA\" -days 365 -config "+INSTALLDIR+"/ssl/openssl.cnf")!=0:
       print("Couldn't generate CA")
    if os.system("openssl req -new -newkey "+sig+" -keyout /opt/test/server.key -out /opt/test/server.csr -nodes -subj \"/CN=localhost\"")!=0:
       print("Couldn't generate CSR")
    if os.system("openssl x509 -req -in /opt/test/server.csr -out /opt/test/server.crt -CA CA.crt -CAkey CA.key -CAcreateserial -days 365")!=0:
       print("Couldn't generate server cert")
    for kem in kems:
        print("Doing KEM %s" % (kem)) 
        # run test:
        # start server:
        server = subprocess.Popen(["openssl", "s_server", "-cert", "/opt/test/server.crt", "-key", "/opt/test/server.key", "-curves", kem, "-www", "-tls1_3", "-accept", "localhost:4433", "&"])
        if server is None:
           print("Couldn' start server for %s/%s" % (sig/kem))
        else:
           # Give server time to come up
           time.sleep(1)
           # Run tests for some time
           client = subprocess.Popen(["openssl", "s_time", "-curves", kem, "-connect", ":4433", "-new", "-time", TEST_TIME, "-verify", "1"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
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

# Dump data
with open("results/handshakes.json", 'w') as outfile:
    json.dump(data, outfile)

