import json
import sys
import os
import re
import datetime

# list of test types
gen_files = [ "speed_kem", "speed_sig", "speed", "handshakes" ]

if len(sys.argv)!=4:
   print("Usage: %s <startdate> <datafile-folder> <output-folder>" % (sys.argv[0]))
   exit(-1)

# Parse start date (param1)
sd = datetime.datetime.strptime(sys.argv[1], '%Y-%m-%d')

# Ensure param2 is directory name:
datadir = os.fsencode(sys.argv[2])
    
outdir = sys.argv[3]

tt = {}
    
# prepare multi-date JSON structures for each test type
for i in gen_files:
   tt[i]={}

# collect all files after start date
for file in os.listdir(datadir):
     filename = os.fsdecode(file)
     if filename.endswith(".tgz"): 
         dt = datetime.datetime.strptime(filename[0:10], '%Y-%m-%d')
         if (dt >= sd): 
            d = dt.strftime("%Y-%m-%d")
            # extract to temporary folder
            os.system("rm -rf tmp && mkdir tmp && cd tmp && tar xzvf "+os.path.join(sys.argv[2], filename))
            # read files populating JSON structure for this date
            for t in gen_files:
               print("Loading %s.json" % (t))
               with open(os.path.join("tmp", "results", t+".json")) as jf:
                  tt[t][d]=json.load(jf) 
               # if -ref files exist, run the merge logic:
               with open(os.path.join("tmp", "results", t+"-ref.json")) as jf:
                  # get data
                  print("Adding in %s-ref.json:" % (t))
                  refs=json.load(jf) 
                  # iterate over all algorithms, adding a -ref variant
                  nd = {}
                  for key in tt[t][d].keys():
                     if key in refs.keys():
                        print("  mixing in %s-ref" % (key))
                        nd[key+"-ref"]=refs[key]
                     nd[key]=tt[t][d][key]
                  tt[t][d]=nd
for i in gen_files:
   with open(os.path.join(outdir, i+".json"), 'w') as outfile:
      json.dump(tt[i], outfile)

