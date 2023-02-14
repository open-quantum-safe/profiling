import json
import re
import subprocess
import sys
import os
from get_cpuinfo import getcpuinfo
from get_cpuinfo import getestimatedcpufrequency
data = {}
# fetch both x86 and aarch64 CPU details:
data["cpuinfo"]=getcpuinfo(["flags", "model name", "cpu MHz", "Features", "CPU implementer", "CPU variant", "CPU part", "BogoMIPS"])
data["config"]={}
estfrequency = getestimatedcpufrequency()
if estfrequency != None:
    data["cpuinfo"]["estfrequency"] = estfrequency
else:
    data["cpuinfo"]["estfreqency"] = "Unavailable"

def get_peak(lines):
    peak = -1
    for line in lines: 
        if line.startswith(" Detailed snapshots: ["):
            match=re.search("\d+ \(peak\).*", line)
            if match:
                peak = int(match.group(0).split()[0])
        if (peak > 0):
            if line.startswith('{: >3d}'.format(peak)): # remove "," and print all numbers except first:
                nl = line.replace(",", "")
                res = nl.split()
                del res[0]
                #print(" ".join(res))
                return res

def parse_config(output):
   lines = output.splitlines()
   loading = False
   for line in lines:
      if loading:
         if line == "\n": # done
            return
         elif line.startswith("Started at"):
                data["config"]["start"] = line[len("Started at "):]
         elif ":" in line:
                data["config"][line[:line.index(":")]]=line[line.index(":")+1:].lstrip()
      elif line.startswith("====="):
         loading=True


fieldname=["insts", "maxBytes", "maxHeap", "extHeap", "maxStack"]

def do_test(alg, meth, methnames, exepath):
   process = subprocess.Popen(["valgrind", "--tool=massif", "--stacks=yes", "--massif-out-file=valgrind-out", exepath, alg, str(meth)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
   (outs, errs) = process.communicate()
   if process.returncode != 0:
      print("Valgrind died with retcode %d and \n%s\n%s\nFatal error. Exiting." % (process.returncode, outs, errs))
      exit(1)
   if len(data["config"]) == 0:
      parse_config(outs)
   process = subprocess.Popen(["ms_print", "valgrind-out"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
   (outs, errs) = process.communicate()
   result = get_peak(outs.splitlines())
   data[alg][methnames[meth]] = {}
   try: 
      print("Result for %s: %s" % (alg, " ".join(result)))
      for i in range(5):
         data[alg][methnames[meth]][fieldname[i]] = result[i]
   except TypeError:
      print("Result for %s: " % (alg))
      print(result)
      print(outs.splitlines())

if len(sys.argv) != 2:
   print("python3 %s <testprogram>" % (sys.argv[0]))
   exit(1)

exepath=sys.argv[1]

if exepath.find("kem")>0:
   methnames=["keygen","encaps","decaps"]
else:
   methnames=["keygen","sign","verify"]

try:
   os.mkdir("build")
   os.mkdir(os.path.join("build", "mem-benchmark"))
except FileExistsError:
   activealgs=[]

# first determine all enabled algorithms
process = subprocess.Popen([exepath], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
(outs, errs) = process.communicate()
for line in outs.splitlines():
   print(line)
   if line.startswith("  algname: "):
      algs = line[len("  algname: "):].split(", ")

activealgs=[]
# weed out algs not enabled
for alg in algs:
   process = subprocess.Popen([exepath, alg, "0"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
   (outs, errs) = process.communicate()
   enabled=True
   for line in outs.splitlines():
      if "not enabled" in line:
         enabled=False
   if enabled:
         activealgs.append(alg)

for alg in activealgs:
   data[alg]={}
   # Activate this for a quick test:
   #if alg=="DEFAULT":
   for i in range(3):
      do_test(alg, i, methnames, exepath)

# Dump data
with open(exepath+".json", 'w') as outfile:
    json.dump(data, outfile)

