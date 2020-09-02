def getcpuinfo(required_tags):
  tags = {}
  fp = open("/proc/cpuinfo", "r")
  lines = fp.readlines()
  for line in lines:
    if ":" in line:
       (t,v)=line.split(":")
       t=t.rstrip().lstrip()
       v=v.rstrip().lstrip()
       if (t in required_tags) and (not t in tags.keys()):
          tags[t]=v 
  return tags

