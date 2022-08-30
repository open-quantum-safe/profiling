import json
import sys
import os
import re
import datetime
import math
import tempfile

tests = [ "speed_kem", "speed_sig", "speed", "mem_kem", "mem_sig" ]
ttypes = [ "", "-ref", "-noport" ]
archs = [ "x86_64", "aarch64", "m1" ]

def output_json(data, date, outpath, test):
    dpath = os.path.join(outpath, date.strftime('%Y-%m-%d'))
    if not os.path.isdir(outpath):
       os.mkdir(outpath)
    if not os.path.isdir(dpath):
       os.mkdir(dpath)
    opath = os.path.join(dpath, test+".json")
    with open(opath, 'w') as outfile:
       json.dump(data, outfile)
    lpath = os.path.join(outpath, test+"-c.list")
    with open(lpath, 'a') as outfile:
       outfile.write(os.path.join(date.strftime('%Y-%m-%d'),test+".json")+"\n")


# works on <date>-<arch>.tgz files located in basepath:
# unpacks them to outpath folder
# if allarchs set to True, require presence of data for all architectures to be successful
# returns True iff successful
def merge(basepath, outpath, date, allarchs=False):
   tmpdir=tempfile.TemporaryDirectory()
   exportedtarballs = 0
   for arch in archs:
      os.mkdir(os.path.join(tmpdir.name, arch))
      exportdir = os.path.join(tmpdir.name, arch, str(date.date()))
      os.mkdir(exportdir)
      for file in os.listdir(basepath):
        filename = os.fsdecode(file)
        if filename.endswith(arch+".tgz"):
            dt = datetime.datetime.strptime(filename[0:10], '%Y-%m-%d')
            if (dt.date() == date.date()): 
               cmd = "cd "+exportdir+" && tar xzvf "+os.path.abspath(os.path.join(basepath, filename))+">/dev/null && mv results/* ."
               exportedtarballs=exportedtarballs+1
               os.system(cmd)

   if (exportedtarballs != len(archs)):
     print("Warning: %d exported tarballs vs %d known architectures at %s." % (exportedtarballs, len(archs), str(date.date())))
     if allarchs: return False
   if exportedtarballs==0:
       print("No Tarballs found for date %s." % (str(sd)))
       return False
   else:
     basepath=tmpdir.name

   # JSON files can now be found in filesystem as follows:
   # <basepath>/<arch>/<date>/<test>-<testtype>.json containing <alg-keyed> results and optionally cpuinfo
   # Goal: Collate them into
   # combined/<date>/<test>.json
   # containing <alg-keyed> tuples: arch/testtype/results and arch/testtype/cpuinfo
   for test in tests:
    data = {}
    for arch in archs:
      # validate folders exist
      path = os.path.join(basepath, arch, date.strftime('%Y-%m-%d'))
      if not os.path.exists(path):
         print("%s not found. Investigate!" % (path))
      # validate data files exist
      else:
        for ttype in ttypes:
            fpath = os.path.join(path, test+ttype+".json")
            if not os.path.exists(fpath):
               print("%s not found. Investigate!" % (fpath))
            else:
              with open(fpath, 'r') as json_file:
                 d = json.load(json_file)
              for k in d.keys():
                 # if not interested in meta-information, activate this:
                 #if k != "cpuinfo" and k != "config":
                 if (not(k in data.keys())):
                      data[k]={}
                      for a in archs:
                         data[k][a]={}
                 try:
                   data[k][arch][ttype]=d[k]
                 except KeyError as ke:
                   print("key error at %s %s %s %s (%s)" %(k,arch,ttype,date))
    output_json(data, date, outpath, test)

   # Special handling for handshakes: structure [sigs][kems][archs][ttype]
   test="handshakes"
   data = {}
   for arch in archs:
      # validate folders exist
      path = os.path.join(basepath, arch, date.strftime('%Y-%m-%d'))
      if not os.path.exists(path):
         print("%s not found. Investigate tests!" % (path))
      # validate data files exist
      else:
        for ttype in ttypes:
         fpath = os.path.join(path, test+ttype+".json")
         if not os.path.exists(fpath):
              print("%s not found. Investigate!" % (fpath))
         else:
            with open(fpath, 'r') as json_file:
              d = json.load(json_file)
              for k in d.keys(): # sig algs
                if (not(k in data.keys())):
                   data[k]={}
                for ka in d[k].keys(): # kem algs
                  if (not(ka in data[k].keys())):
                     data[k][ka]={}
                     for a in archs:
                        data[k][ka][a]={}
                        for tt in ttypes:
                           data[k][ka][a][tt]={}
                  try:
                    # Sometimes INF or NAN sneaks in; convert to something that JSON can deal with:
                    if ((math.isnan(d[k][ka])) or (math.isinf(d[k][ka]))):
                      d[k][ka] = 999999999.9999
                    data[k][ka][arch][ttype][test]=d[k][ka]
                  except KeyError as ke:
                      print("key error at %s %s %s %s (%s)" %(k,ka,arch,ttype,date))
   output_json(data, date, outpath, test)

   return True

# Begin main :
if len(sys.argv)!=4:
   print("OQS-profiling datafile combiner.")
   print("Usage: %s [<startdate>|number-of-runs-back-from-today] <datafile-folder> <output-folder> " % (sys.argv[0]))
   exit(-1)

retdays = 1000 # maximum number of days to return
maxdays = 10000 # maximum number of days to search
# Parse start date (param1)
try:
   sd = datetime.datetime.strptime(sys.argv[1], '%Y-%m-%d')
except ValueError as ve:
   # if not successful, first parameter is number of days to check
   sd = datetime.datetime.today()
   retdays = int(sys.argv[1])

# Ensure param2 is directory name:
datadir = os.fsencode(sys.argv[2])
    
outdir = sys.argv[3]
    
# Start at date given and go back until error is returned or retdays is 0

dayscollected=False
while(retdays>0 and maxdays>0):
    if (merge(sys.argv[2], sys.argv[3], sd, True)):
        print("Collected OK: %s" % (str(sd)))
        retdays=retdays-1
    sd = sd+datetime.timedelta(days = -1)
    maxdays=maxdays-1 # ensures this loop terminates
    dayscollected=True

if not dayscollected:
    print("Not enough days collected. Error-Exit.")
    exit(-1)
