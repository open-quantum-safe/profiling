import subprocess
from sys import platform

def getestimatedcpufrequency():
    if platform != "linux" and platform != "linux2":
        return None

    # estimating CPU frequency using perf
    p = subprocess.Popen(["lscpu"], text=True, stdout=subprocess.PIPE)
    maxfreq = None
    minfreq = None
    while True:
        line = p.stdout.readline()
        if not line: break
        if "CPU max MHz" in line:
            try:
                maxfreq = line.split(":")[1].rstrip().lstrip()
                unit = line.split(":")[0].split(" ")[2]
                maxfreq = "{} {}".format(maxfreq, unit)
            except:
                pass
        if "CPU min MHz" in line:
            try:
                minfreq = line.split(":")[1].rstrip().lstrip()
                unit = line.split(":")[0].split(" ")[2]
                minfreq = "{} {}".format(minfreq, unit)
            except:
                pass

    return minfreq, maxfreq


def getcpuinfo(required_tags):
  tags = {}
  try:
     fp = open("/proc/cpuinfo", "r")
     lines = fp.readlines()
  except:
     lines = None
  if lines is None:
     required_tags = ["machdep.cpu.brand_string", "machdep.cpu.core_count"]
     p = subprocess.Popen(["sysctl", "-a"], stdout=subprocess.PIPE)
     lines = []
     while True:
         line = p.stdout.readline()
         if not line: break
         lines.append(line.decode())

  for line in lines:
    if ":" in line:
       (t,v) = line.split(":",1)
       t = t.rstrip().lstrip()
       v = v.rstrip().lstrip()
       if (t in required_tags) and (not t in tags.keys()):
          tags[t] = v 
  return tags
