import sys
import os
import datetime
import tempfile

def retrieve(s3addr, outpath, date):
   cmd = "s3cmd get "+s3addr+"/"+date.strftime("%Y-%m-%d")+"* " + outpath
   print(os.system(cmd))
   return True

# Begin main :
sd = datetime.datetime.today()
if len(sys.argv)!=4:
   print("S3 file retriever: %s #days-back-from-today <s3-bucket address> <output-folder> " % (sys.argv[0]))
   exit(-1)

# Fails if no int given:
retdays = int(sys.argv[1])

# Ensure param2 is an S3 address:
if (sys.argv[2][0:5] != "s3://"):
    print("S3 address expected but %s provided. Exiting." % (sys.argv[2]))
    exit(-1)
    
# Ensure param3 is directory name and fail if not:
outdir = sys.argv[3]

if not os.path.isdir(outdir):
    print("%s not a directory. Exiting." % (outdir))
    exit(-1)
    
dayscollected=False
while((retdays>0) and retrieve(sys.argv[2], sys.argv[3], sd)):
   sd = sd+datetime.timedelta(days = -1)
   retdays=retdays-1
   dayscollected=True

if not dayscollected:
   exit(-1)
