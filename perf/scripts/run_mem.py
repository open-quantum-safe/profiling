import json
import re
import subprocess
import sys

data = {}

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

fieldname=["insts", "maxBytes", "maxHeap", "extHeap", "maxStack"]

def do_test(alg, meth, methnames, exepath):
   process = subprocess.Popen(["valgrind", "--tool=massif", "--stacks=yes", "--massif-out-file=valgrind-out", exepath, alg, str(meth)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
   (outs, errs) = process.communicate()
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

process = subprocess.Popen([exepath], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
(outs, errs) = process.communicate()
for line in outs.splitlines():
   print(line)
   if line.startswith("  algname: "):
      algs = line[len("  algname: "):].split(", ")


for alg in algs:
   data[alg]={}
   # Activate this for a quick test:
   #if alg=="BIKE1-L3-FO" or alg=="DILITHIUM_3":
   for i in range(3):
      do_test(alg, i, methnames, exepath)

# Dump data
with open(exepath+".json", 'w') as outfile:
    json.dump(data, outfile)

