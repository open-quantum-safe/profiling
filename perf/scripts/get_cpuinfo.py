import subprocess
import platform
from shutil import which
def getestimatedcpufrequency():
    # We should be checking the architecture we are running on, but platform.processor()
    # is "unknown" in our container
    if platform.system() != "Linux":
        return None
    p = subprocess.run(["gcc", "-O2", "-o", "cpu_frequency_estimate", "cpu_frequency_estimate.c"])
    if p.returncode != 0:
        print("Failed to compile")
        raise Exception("cpu_frequency_estimate.c failed to compile")
    p = subprocess.Popen(["./cpu_frequency_estimate"], shell=False,stdout=subprocess.PIPE)
    lines = p.communicate()[0].decode()
    frequency = None
    for line in lines.splitlines():
        if "Estimated frequency" in line:
            l = line.split("=")[1]
            l = l.rstrip().lstrip()
            return l
    
    return None

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
