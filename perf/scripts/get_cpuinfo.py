import subprocess

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
       (t,v)=line.split(":",1)
       t=t.rstrip().lstrip()
       v=v.rstrip().lstrip()
       if (t in required_tags) and (not t in tags.keys()):
          tags[t]=v 
  return tags
