![Static Badge](https://img.shields.io/badge/status-deprecated-red)

# profiling

Testing various functional and non-functional properties like performance and memory consumption

## <span style="color: red;">DEPRECATION NOTICE</span>

<b><span style="color: red;">The Open Quantum Safe project has discontinued development of our profiling project.  This repository is being archived as read-only.  Use of this code is not recommended, as it is not maintained and may produce unreliable data. If you are interested in contributing to OQS benchmarking efforts, please reach out via the [OQS discussion board on Github](https://github.com/orgs/open-quantum-safe/discussions).</span></b>

## Purpose

This repository is to contain software geared to collect profiling information across the algorithms supported by liboqs at different levels of the software and network stack.

Particularly, measurements will be collected using 
1) ´liboqs´ library-level performance testing using ´speed_sig´ and ´speed_kem´ for execution performance numbers and ´test_sig_mem´ and ´test_kem_mem´ for memory consumption numbers (heap and stack)
2) ´openssl´ application-level performance testing using ´openssl speed´
3) ´openssl´ "basic network"-level raw handshake performance testing using ´openssl s_time´
4) "Simulated"/controlled network-level performance testing [not yet implemented]
5) "Full stack" performance testing using standard client software like ´curl´ and standard server software like ´nginx´ [not yet implemented].

This repository will not contain tests replicating raw algorithm-level testing as done by [Supercop](https://bench.cr.yp.to/supercop.html).

## Methodology

All tests 
- are packaged into standalone Docker images facilitating execution across different (cloud) platforms and hardware architectures & CPU optimizations
- are designed to return JSON output representing current profiling numbers that can be stored arbitrarily; initial storage facilities are provided to deposit data into AWS S3.
- allow to also collect/document profiling numbers of classic crypto to permit comparison with PQC algorithms
- can be visualized by suitable Chart.js code: see [visualization folder](https://github.com/open-quantum-safe/profiling/tree/master/visualization).

Wrapper scripts are created to facilitate automatically running these tests on different cloud infrastructures and storing the resulting JSON output as well as the wrapping HTML and JavaScript code.
