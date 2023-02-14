import json
import sys
import os
import re
from enum import Enum
from get_cpuinfo import getcpuinfo
from get_cpuinfo import getestimatedcpufrequency

class State(Enum):
   starting=0
   config=1
   parsing=2

data={}
# fetch both x86 and aarch64 CPU details:
data["cpuinfo"]=getcpuinfo(["flags", "model name", "cpu MHz", "Features", "CPU implementer", "CPU variant", "CPU part", "BogoMIPS"])
estfrequency = getestimatedcpufrequency()
if estfrequency != None:
    data["cpuinfo"]["estfrequency"] = estfrequency
else:
    data["cpuinfo"]["estfrequency"] = "Unavailable"

if len(sys.argv)!=2:
   print("Usage: %s <logfile to parse>" % (sys.argv[0]))
   exit(-1)

fn = sys.argv[1]
state = State.starting
alg=""

with open(fn) as fp: 
   while True:
      line = fp.readline() 
      if not line: 
            break 
      # Remove newlines
      line = line.rstrip()
      if state==State.starting:
           if line.startswith("Configuration info"):
             state=State.config
             data["config"]={}
             fp.readline()
      elif state==State.config:
             if line=="\n": # Skip forward
               fp.readline()
               fp.readline()
             if line.startswith("-------"):
                state=State.parsing
             elif line.startswith("Started at"):
                data["config"]["start"] = line[len("Started at "):]
                fp.readline()
             elif ":" in line:
                data["config"][line[:line.index(":")]]=line[line.index(":")+1:].lstrip() 
      elif state==State.parsing:
           if line.startswith("Ended"): # Finish
              break
           else:
               alg = line[:line.index(" ")]
               data[alg]={}
               p = re.compile('\S+\s*\|')
               for i in 0,1,2:
                 x=p.findall(fp.readline().rstrip())
                 tag = x[0][:x[0].index(" ")]
                 ctag = tag+"cycles"
                 iterations = float(x[1][:x[1].index(" ")])
                 t = float(x[2][:x[2].index(" ")])
                 cycles = float(x[5][:x[5].index(" ")])
                 val = iterations/t
                 data[alg][tag]=round(val,2)
                 data[alg][ctag]=int(cycles)
      else:
           print("Unknown state: %s" % (line))

# Dump data
with open(os.path.splitext(fn)[0]+".json", 'w') as outfile:
    json.dump(data, outfile)
