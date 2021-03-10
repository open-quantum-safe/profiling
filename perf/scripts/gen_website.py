import json
import sys
import os
import re
import datetime

gen_files = [ "speed_kem", "speed_sig", "speed", "handshakes", "speed_kem-ref", "speed_sig-ref", "speed-ref", "handshakes-ref", "mem_kem", "mem_sig", "mem_kem-ref", "mem_sig-ref" ]

# will contain list of date/tgz-filename paths to be used for generating .list files:
files = {}

if len(sys.argv)!=5:
   print("Usage: %s <startdate> <datafile-folder> <output-folder> arch" % (sys.argv[0]))
   exit(-1)

# Parse start date (param1)
sd = datetime.datetime.strptime(sys.argv[1], '%Y-%m-%d')

# Ensure param2 is directory name:
datadir = os.fsencode(sys.argv[2])
    
outdir = sys.argv[3]
arch=sys.argv[4]
    
# collect all files after start date
for file in os.listdir(datadir):
     filename = os.fsdecode(file)
     if filename.endswith(arch+".tgz"):
         dt = datetime.datetime.strptime(filename[0:10], '%Y-%m-%d')
         if (dt > sd): 
            files[dt.date()]=os.path.join(sys.argv[2], filename)


# operate on files in alphabetical==chronological order:
for f in sorted(files.keys(), key=lambda k: k):
   # generate .list files:
   for i in gen_files:
      with open(os.path.join(outdir, i+".list"), "a+") as fp:
         fp.write(str(f)+"/"+i+".json\n")
   # extract data files to correct location:
   print("extracting "+files[f]);
   os.system("tar xzvf "+files[f]+" && mv results "+os.path.join(outdir, str(f)))

