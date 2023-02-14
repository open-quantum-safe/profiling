#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>

#ifndef ITRS
#define ITRS 1000000000
#endif

// Originally from https://uob-hpc.github.io/2017/11/22/arm-clock-freq.html
// with X86 support added by Jason Goertzen

#if defined(__aarch64__) || defined(_M_ARM64)
#define INST0 "add  %[i], %[i], #1\n\t"
#define INST1 INST0 INST0 INST0 INST0   INST0 INST0 INST0 INST0 \
              INST0 INST0 INST0 INST0   INST0 INST0 INST0 INST0
#define INST2 INST1 INST1 INST1 INST1   INST1 INST1 INST1 INST1 \
              INST1 INST1 INST1 INST1   INST1 INST1 INST1 INST1
#define INST3 INST2 INST2 INST2 INST2   INST2 INST2 INST2 INST2 \
              INST2 INST2 INST2 INST2   INST2 INST2 INST2 INST2
#define __OQS_CPU_ESTIMATE_SUPPORTED_PLATFORM
#elif defined(__x86_64__) || defined(_M_X64)
#define INST0 "inc  %[i]\n\t"
#define INST1 INST0 INST0 INST0 INST0   INST0 INST0 INST0 INST0 \
              INST0 INST0 INST0 INST0   INST0 INST0 INST0 INST0
#define INST2 INST1 INST1 INST1 INST1   INST1 INST1 INST1 INST1 \
              INST1 INST1 INST1 INST1   INST1 INST1 INST1 INST1
#define INST3 INST2 INST2 INST2 INST2   INST2 INST2 INST2 INST2 \
              INST2 INST2 INST2 INST2   INST2 INST2 INST2 INST2
#define __OQS_CPU_ESTIMATE_SUPPORTED_PLATFORM
#endif

#if defined(__OQS_CPU_ESTIMATE_SUPPORTED_PLATFORM)
int main(int argc, char *argv[])
{
  struct timeval tv;
  gettimeofday(&tv, NULL);
  double start = tv.tv_sec + tv.tv_usec*1e-6;

  long instructions;
  for (instructions = 0; instructions < ITRS;) {
    asm volatile (
      INST3
      : [i] "+r" (instructions)
      :
      : "cc"
      );
  }

  gettimeofday(&tv, NULL);
  double end = tv.tv_sec + tv.tv_usec*1e-6;
  double runtime = end-start;
  printf("Runtime (seconds)     = %lf\n", runtime);
  printf("Instructions executed = %ld\n", instructions);
  printf("Estimated frequency   = %.2lf MHz\n", (instructions/runtime)*1e-6);

  return 0;
}
#else
int main(int argc, char *argv[])
{
  printf("Runtime (seconds)     = PLATFORM UNSUPPORTED\n");
  printf("Instructions executed = PLATFORM UNSUPPORTED\n");
  printf("Estimated frequency   = PLATFORM_UNSUPPORTED\n");

  return 0;
}
#endif
