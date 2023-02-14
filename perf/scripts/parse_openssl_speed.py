import json
import sys
import os
import re
from enum import Enum
from get_cpuinfo import getcpuinfo
from get_cpuinfo import getestimatedcpufrequency

# get operations per sec tags in a line containing <tagname>/s 
def gettags(line):
    tags = []
    while "/s" in line:
          i=line.index("/s")
          start=line.rfind(" ",0,i)
          tags.append(line[start+1:i+2])
          line = line[i+2:]
    return tags        

# parse engine state
class State(Enum):
   starting=0
   config=1
   parsing=2
   skipping=3

if len(sys.argv)!=2:
   print("Usage: %s <logfile to parse>" % (sys.argv[0]))
   exit(-1)

# Resultdata
data={}
# fetch both x86 and aarch64 CPU details:
data["cpuinfo"]=getcpuinfo(["flags", "model name", "cpu MHz", "Features", "CPU implementer", "CPU variant", "CPU part", "BogoMIPS"])
estfrequency = getestimatedcpufrequency()
if estfrequency != None:
    data["cpuinfo"]["estfrequency"] = estfrequency
else:
    data["cpuinfo"]["estfrequency"] = "Unavailable"

fn = sys.argv[1]
state = State.config
data["config"]={}
alg=""

with open(fn) as fp: 
   while True:
      line = fp.readline() 
      if not line: 
            break 
      # Remove newlines
      line = line.rstrip()
      if state==State.config:
           data["config"]["version"]=line
           # build
           b=fp.readline().rstrip()
           data["config"][b[:b.index(":")]]=b[b.index(":")+1:]
           # options:
           b=fp.readline().rstrip()
           data["config"][b[:b.index(":")]]=b[b.index(":")+1:]
           # compiler:
           b=fp.readline().rstrip()
           data["config"][b[:b.index(":")]]=b[b.index(":")+1:]
           state=State.skipping
      elif state==State.skipping:
           # determine number and name of values:
           if "/s" in line:
              state=State.parsing
              tags=gettags(line)
      elif state==State.parsing:
           if "/s" in line:
             tags = gettags(line)
           else:
               # Alg name is everything from start of line until start of first decimal number
               di = line.index(".")
               alg = line[:line.rfind(" ",0,di)].rstrip().lstrip().replace(":","")
               data[alg]={}
               for ti in range(len(tags)):
                   # go backwards:
                   f=line.rfind(" ",0,len(line)-2) 
                   val = line[f+1:]
                   line = line[:f].strip()
                   data[alg][tags[len(tags)-1-ti]]=float(val)
      else:
           print("Unknown state: %s" % (line))

# Dump data
with open(os.path.splitext(fn)[0]+".json", 'w') as outfile:
    json.dump(data, outfile)
