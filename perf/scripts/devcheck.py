from datetime import timedelta
from datetime import date
import os
import sys
import json
import tempfile

# This script has to receive as first parameter a folder containing different performance 
# measurements stored in JSON format in folders organized by day (yyyy-mm-dd format).
# It will compare today()s measurements with the average of the last CHECKDAYs values
# and flag differences bigger than MAXDIFF.

# This many days to use for average value check
CHECKDAYS = 5

# This defines permissible difference in percent
MAXDIFF=20



if len(sys.argv)>4 or len(sys.argv)<3:
    print("Usage: [python3] %s <results-folder> <arch> [last-deviations-file]. Exiting." % (sys.argv[0]), file=sys.stderr)
    print("       arch: Supported architecture, e.g., x86_64, aarch64, m1")
    exit(1)


# idea is to collect in this dict a list of all <files>-<algorithm>-<measurement>: value (float)
todaysvalues={}

# extract tarball ./dir/filename*.tgz into tmpdir/day
def extract(tmpdir, dir, filename, day):
    tarball = os.path.join(os.path.abspath(dir), filename)
    ndf = os.path.join(tmpdir, day)
    #print("Extracting %s to %s" % (tarball, tmpdir), file = sys.stderr)
    os.system("mkdir "+ndf+"&& cd "+ndf+" && tar xzvf "+tarball+" > /dev/null")
    return os.path.join(ndf, "results")

# recursively flatten JSON; retain only all-numbers structures
def iterate_dict(d, prefix):
   allnumbers=True
   valdict={}
   for k in d:
     if isinstance(d[k],dict):
        # flatten the JSON recursively
        valdict.update(iterate_dict(d[k], prefix+"-"+k))
     else:
        # collect the values as floats:
        if isinstance(d[k],int):
           valdict[prefix+"-"+k] = float(d[k])
        elif isinstance(d[k],float):
           valdict[prefix+"-"+k] = d[k]
        else: 
           try:
              valdict[prefix+"-"+k] = float(d[k])
           except ValueError as e:
                allnumbers=False
        # activate if interested in particular value
        # if prefix+"-"+k=="speed-ref.json-kyber768-decap/s":
        #    print("CME:"+str(valdict[prefix+"-"+k]))
   if allnumbers:
     return valdict
   else:
     return {}

t = date.today()
td = timedelta(days = 1)

# collect all .json files of today:
files = []

datafolder=os.path.join(sys.argv[1], str(t))
dotarballs = False

if not os.path.isdir(datafolder):
   # find tgz file with suitable date
   candidatefiles = os.listdir(sys.argv[1])
   datafolder = None
   
   for f in candidatefiles:
      if f.startswith(str(t)) and sys.argv[2] in f:
          tmpd = tempfile.TemporaryDirectory()
          tmpdir = tmpd.name
          datafolder = extract(tmpdir, sys.argv[1], f, str(t))
          dotarballs = True
          break
   if datafolder == None:
      print("Cannot find datafolder to process. Exiting.")
      exit(1)

with os.scandir(datafolder) as entries:
    for entry in entries:
        files.append(entry.name)
        with open(os.path.join(datafolder, entry.name)) as json_file:
            todaysvalues[entry.name] = iterate_dict(json.load(json_file), entry.name)

prev = {}
avgs = {}

# collect data for the same files over the prev CHECKDAYS days
i=1 # number of days to check back in the past
while(CHECKDAYS>0):
   day = str(t-(i+1)*td)
   # same approach as for todaysvalues: flatten the data into key:float-value pairs:
   if dotarballs:
       #print("Search tarballs for %s" % (day), file = sys.stderr)
       datapath=""
       for f in candidatefiles:
          if f.startswith(day) and sys.argv[2] in f:
             datapath = os.path.join(extract(tmpdir, sys.argv[1], f, day))
             break
   else:
       datapath = os.path.join(sys.argv[1], day)
   if datapath != "":
     prev[day]={}
     for file in files:
       try:
          with open(os.path.join(datapath, file)) as json_file:
              prev[day][file] = iterate_dict(json.load(json_file), file)
       except FileNotFoundError as fnf:
          print("Some data not available: "+str(fnf), file = sys.stderr)
     CHECKDAYS = CHECKDAYS-1
   i=i+1

# create the value avgs for the previous days:
sums = {}
for file in files:
 avgs[file]={}
 sums[file]={}
 dc=0
 for day in prev:
  if file in prev[day]:
   dc = dc+1
   for k in prev[day][file]:
      if k in sums[file]:
         sums[file][k]=sums[file][k]+prev[day][file][k]
      else:
         sums[file][k]=prev[day][file][k]
 for k in sums[file]:
    avgs[file][k]=sums[file][k]/dc

knowndevs={}
if (len(sys.argv)==4):
   # Now (try to) load file with known deviations:
   try:
      with open(sys.argv[3], "r") as lastdevfile:
         for line in lastdevfile.readlines():
             knowndevs[line.split("|")[1]] = float(line.split("|")[0])
   except FileNotFoundError as e:
      print("No lastdeviations file found at "+sys.argv[3], file=sys.stderr)

cnt=0
devs=0
for file in todaysvalues:
   for k in todaysvalues[file]:
    if k in avgs[file]:
      #print("AVG[%s in %s] = %f" % (k, file, avgs[file][k]), file = sys.stderr)
      delta = 100.0*abs(todaysvalues[file][k]-avgs[file][k])/min(todaysvalues[file][k],avgs[file][k])
      cnt=cnt+1
      if (delta > MAXDIFF):
          if k in knowndevs:
             if delta>knowndevs[k]*(1+MAXDIFF/100):
                print("%4.2f|%s|(T: %f - AVG: %f: larger dev than before)" % (delta, k, todaysvalues[file][k], avgs[file][k]))
             else:
                print("%4.2f|%s|(T: %f - AVG: %f (expected: %4.2f). Ignoring." % (delta, k, todaysvalues[file][k], avgs[file][k], knowndevs[k]))
          else:
             print("%4.2f|%s|(T: %f - AVG: %f)" % (delta, k, todaysvalues[file][k], avgs[file][k]))
             devs=devs+1

# print summary report to STDERR to avoid it going to results file (STDOUT)
print("%d overall data points with %d unknown deviations (%f%%)" % (cnt, devs, devs*100.0/cnt), file=sys.stderr)


