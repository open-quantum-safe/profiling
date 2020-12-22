import smtplib, ssl, os, sys

SMTP_PORT = 465  # For SSL
SMTP_SERVER = "www14.servertown.ch"
sender_email = "oqs@baentsch.ch"
sender_password = os.getenv("SMTP_PWD")

receiver_emails = "info@baentsch.ch"
message = """\
From: OQS event notification services <oqs@baentsch.ch>
Subject: Profiling deviation notification

"""

if len(sys.argv)!=2:
    print("Usage: [python3] %s <file to send>. Exiting." % (sys.argv[0]))
    exit(1)

if sender_password == None or len(sender_password)<5:
   print("Sender password too short. Set in SMTP_PWD env var? Exiting.")
   exit(1)

with open(sys.argv[1], "r") as file:
   data = file.read()

if len(data)<2:
   print("Nothing to send, really. Exiting.")
   exit(1)

context = ssl.create_default_context()

message=message+data

with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
    server.login(sender_email, sender_password)
    for r in receiver_emails.split(","):
        server.sendmail(sender_email, r, message)
    server.quit()

