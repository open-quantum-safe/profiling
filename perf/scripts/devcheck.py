from datetime import timedelta
from datetime import date
import os
import sys
import json

# This script has to receive as first parameter a folder containing different performance 
# measurements stored in JSON format in folders organized by day (yyyy-mm-dd format).
# It will compare today()s measurements with the average of the last CHECKDAYs values
# and flag differences bigger than MAXDIFF.

# This many days to use for average value check
CHECKDAYS = 5

# This defines permissible difference in percent
MAXDIFF=20



if len(sys.argv)>3 or len(sys.argv)<2:
    print("Usage: [python3] %s <results-folder> [last-deviations-file]. Exiting." % (sys.argv[0]), file=sys.stderr)
    exit(1)



# idea is to collect in this dict a list of all <files>-<algorithm>-<measurement>: value (float)
todaysvalues={}

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

with os.scandir(sys.argv[1]+os.sep+str(t)) as entries:
    for entry in entries:
        files.append(entry.name)
        with open(sys.argv[1]+os.sep+str(t)+os.sep+entry.name) as json_file:
            todaysvalues[entry.name] = iterate_dict(json.load(json_file), entry.name)

prev = {}
avgs = {}

# collect data for the same files over the prev CHECKDAYS days
for i in range(CHECKDAYS):
   day = str(t-(i+1)*td)
   # same approach as for todaysvalues: flatten the data into key:float-value pairs:
   prev[day]={}
   for file in files:
        with open(sys.argv[1]+os.sep+day+os.sep+file) as json_file:
            prev[day][file] = iterate_dict(json.load(json_file), file)

# create the value avgs for the previous days:
for file in files:
 avgs[file]={}
 for day in prev:
   for k in prev[day][file]:
      try:
         avgs[file][k]=avgs[file][k]+prev[day][file][k]/CHECKDAYS
      except KeyError:
         avgs[file][k]=prev[day][file][k]/CHECKDAYS

knowndevs={}
if (len(sys.argv)==3):
   # Now (try to) load file with known deviations:
   try:
      with open(sys.argv[2], "r") as lastdevfile:
         for line in lastdevfile.readlines():
             knowndevs[line.split("|")[1]] = float(line.split("|")[0])
   except FileNotFoundError as e:
      print("No lastdeviations file found at "+sys.argv[2], file=sys.stderr)

cnt=0
devs=0
for file in todaysvalues:
   for k in todaysvalues[file]:
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


