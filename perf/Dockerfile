# Multi-stage build: First the full builder image:

# Default location where all binaries wind up:
ARG INSTALLDIR=/opt/oqssa

# liboqs build defines (https://github.com/open-quantum-safe/liboqs/wiki/Customizing-liboqs)
# for minimal build:
#ARG LIBOQS_BUILD_DEFINES="-DOQS_MINIMAL_BUILD=ON"
ARG LIBOQS_BUILD_DEFINES=""

# Default root CA signature algorithm; can be set to any listed at https://github.com/open-quantum-safe/openssl#authentication
ARG SIG_ALG="dilithium2"

# Define the degree of parallelism when building the image; leave the number away only if you know what you are doing
ARG MAKE_DEFINES="-j 4"

# Define main performance architecture(s)
ARG PERF_ARCH_X64="skylake-avx512"

FROM debian:bullseye as intermediate
# Take in all global args
ARG INSTALLDIR
ARG LIBOQS_BUILD_DEFINES
ARG SIG_ALG
ARG PERF_ARCH_X64
ARG MAKE_DEFINES

LABEL version="3"

ENV DEBIAN_FRONTEND noninteractive

# Get all software packages required for building all components:
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get dist-upgrade -y && \
    apt-get install -y gcc \
       cmake ninja-build \
       autoconf automake git libtool make unzip wget zlib1g-dev \
       doxygen  \
       python3 python3-nose python3-rednose python3-pytest python3-pytest-xdist docker.io \
       python3-psutil \
       maven openjdk-11-jdk \
       docker \
       s3fs

# get all sources
WORKDIR /opt
RUN git clone --depth 1 --branch main https://github.com/open-quantum-safe/liboqs && \
    git clone --depth 1 --branch master https://github.com/openssl/openssl.git ossl-src && \
    git clone --depth 1 --branch main https://github.com/open-quantum-safe/oqs-provider.git

# Build OpenSSL3; set softlink to lib dir for cmake FindPackage
WORKDIR /opt/ossl-src
RUN LDFLAGS="-Wl,-rpath -Wl,${INSTALLDIR}/lib64" ./config shared --prefix=${INSTALLDIR} && \
    make ${MAKE_DEFINES} && make install_sw && make install_ssldirs && ln -s ${INSTALLDIR}/lib64 ${INSTALLDIR}/lib;

# build liboqs shared and static, distributable (x86_64)
WORKDIR /opt/liboqs
# base platform build (x86_64)
RUN mkdir build && cd build && cmake -GNinja .. ${LIBOQS_BUILD_DEFINES} -DOPENSSL_ROOT_DIR=${INSTALLDIR} -DOQS_DIST_BUILD=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_PREFIX=${INSTALLDIR} && ninja && ninja install
RUN mkdir build-static && cd build-static && cmake -GNinja -DOPENSSL_ROOT_DIR=${INSTALLDIR} .. ${LIBOQS_BUILD_DEFINES} -DOQS_DIST_BUILD=ON -DBUILD_SHARED_LIBS=OFF -DCMAKE_INSTALL_PREFIX=${INSTALLDIR} && ninja && ninja install

# Build oqs-provider distributable
WORKDIR /opt/oqs-provider
RUN ln -s ../ossl-src openssl && cmake -DOPENSSL_ROOT_DIR=${INSTALLDIR} -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=${INSTALLDIR} -S . -B _build && cmake --build _build  && cp _build/lib/oqsprovider.so ${INSTALLDIR}/lib64/ossl-modules/oqsprovider-plain.so && sed -i "s/default = default_sect/default = default_sect\noqsprovider = oqsprovider_sect/g" /opt/oqssa/ssl/openssl.cnf && sed -i "s/\[default_sect\]/\[default_sect\]\nactivate = 1\n\[oqsprovider_sect\]\nactivate = 1\n/g" /opt/oqssa/ssl/openssl.cnf && sed -i "s/providers = provider_sect/providers = provider_sect\nssl_conf = ssl_sect\n\n\[ssl_sect\]\nsystem_default = system_default_sect\n\n\[system_default_sect\]\nGroups = \$ENV\:\:DEFAULT_GROUPS\n/g" /opt/oqssa/ssl/openssl.cnf && sed -i "s/HOME\t\t\t= ./HOME           = .\nDEFAULT_GROUPS = kyber512/g" /opt/oqssa/ssl/openssl.cnf

# Build ref-only variants and store in INSTALLDIR-ref (x86_64)
WORKDIR /opt/liboqs
RUN mkdir build-shared-ref && cd build-shared-ref && cmake -GNinja .. ${LIBOQS_BUILD_DEFINES} -DOPENSSL_ROOT_DIR=${INSTALLDIR} -DOQS_DIST_BUILD=OFF -DBUILD_SHARED_LIBS=ON -DOQS_OPT_TARGET="generic" -DCMAKE_INSTALL_PREFIX=${INSTALLDIR} && ninja && ninja install
RUN mkdir build-static-ref && cd build-static-ref && cmake -GNinja -DOPENSSL_ROOT_DIR=${INSTALLDIR} .. ${LIBOQS_BUILD_DEFINES} -DOQS_DIST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DOQS_OPT_TARGET="generic" -DCMAKE_INSTALL_PREFIX=${INSTALLDIR} && ninja && ninja install
WORKDIR /opt/oqs-provider
RUN cmake -DOPENSSL_ROOT_DIR=${INSTALLDIR} -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=${INSTALLDIR} -S . -B _build && cmake --build _build  && cp _build/lib/oqsprovider.so ${INSTALLDIR}/lib64/ossl-modules/oqsprovider-ref.so

# Build noportable fast variants and store in INSTALLDIR-noport (x86_64)
WORKDIR /opt/liboqs
RUN mkdir build-shared-noport && cd build-shared-noport && cmake -GNinja .. ${LIBOQS_BUILD_DEFINES} -DOPENSSL_ROOT_DIR=${INSTALLDIR} -DOQS_DIST_BUILD=OFF -DBUILD_SHARED_LIBS=ON -DOQS_OPT_TARGET=${PERF_ARCH_X64} -DCMAKE_INSTALL_PREFIX=${INSTALLDIR} && ninja && ninja install
RUN mkdir build-static-noport && cd build-static-noport && cmake -GNinja -DOPENSSL_ROOT_DIR=${INSTALLDIR} .. -DOQS_DIST_BUILD=OFF ${LIBOQS_BUILD_DEFINES} -DBUILD_SHARED_LIBS=OFF -DOQS_OPT_TARGET=${PERF_ARCH_X64} -DCMAKE_INSTALL_PREFIX=${INSTALLDIR} && ninja && ninja install
WORKDIR /opt/oqs-provider
RUN cmake -DOPENSSL_ROOT_DIR=${INSTALLDIR} -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=${INSTALLDIR} -S . -B _build && cmake --build _build  && cp _build/lib/oqsprovider.so ${INSTALLDIR}/lib64/ossl-modules/oqsprovider-noport.so

# set path to use 'new' openssl. Dyn libs have been properly linked in to match
ENV PATH="${INSTALLDIR}/bin:${PATH}"

# generate certificates for openssl s_server, which is what we will test curl against
ENV OPENSSL=${INSTALLDIR}/bin/openssl
ENV OPENSSL_CNF=${INSTALLDIR}/ssl/openssl.cnf

# Activate one provider to allow the next commands to run:
RUN cp ${INSTALLDIR}/lib64/ossl-modules/oqsprovider-plain.so ${INSTALLDIR}/lib64/ossl-modules/oqsprovider.so
WORKDIR ${INSTALLDIR}/bin
# generate CA key and cert
RUN set -x && \
    ${OPENSSL} req -x509 -new -newkey ${SIG_ALG} -keyout CA.key -out CA.crt -nodes -subj "/CN=oqstest CA" -days 365 -config ${OPENSSL_CNF} 

WORKDIR /

## second stage: Only create minimal image without build tooling and intermediate build results generated above:
FROM debian:bullseye-slim as dev
# Take in all global args
ARG INSTALLDIR
ARG SIG_ALG

# Dependencies for logfile analysis and S3FS:
# Get all software packages required for building all components:
RUN apt update && apt upgrade -y && \
    apt dist-upgrade -y && \
    apt install -y python3 fuse valgrind libssl-dev s3fs git gcc && \
    apt autoremove && rm -rf /var/cache/apt/*

# Retain the ${INSTALLDIR} contents in the final image
COPY --from=intermediate ${INSTALLDIR} ${INSTALLDIR}
# Also retain liboqs speed-executables
COPY --from=intermediate /opt/liboqs/build-static/tests/speed_kem ${INSTALLDIR}/bin/speed_kem
COPY --from=intermediate /opt/liboqs/build-static/tests/speed_sig ${INSTALLDIR}/bin/speed_sig
COPY --from=intermediate /opt/liboqs/build-static-ref/tests/speed_kem ${INSTALLDIR}/bin/speed_kem-ref
COPY --from=intermediate /opt/liboqs/build-static-ref/tests/speed_sig ${INSTALLDIR}/bin/speed_sig-ref
COPY --from=intermediate /opt/liboqs/build-static-noport/tests/speed_kem ${INSTALLDIR}/bin/speed_kem-noport
COPY --from=intermediate /opt/liboqs/build-static-noport/tests/speed_sig ${INSTALLDIR}/bin/speed_sig-noport
# Also retain liboqs test_mem-executables
COPY --from=intermediate /opt/liboqs/build-static/tests/test_kem_mem ${INSTALLDIR}/bin/test_kem_mem
COPY --from=intermediate /opt/liboqs/build-static/tests/test_sig_mem ${INSTALLDIR}/bin/test_sig_mem
COPY --from=intermediate /opt/liboqs/build-static-ref/tests/test_kem_mem ${INSTALLDIR}/bin/test_kem_mem-ref
COPY --from=intermediate /opt/liboqs/build-static-ref/tests/test_sig_mem ${INSTALLDIR}/bin/test_sig_mem-ref
COPY --from=intermediate /opt/liboqs/build-static-noport/tests/test_kem_mem ${INSTALLDIR}/bin/test_kem_mem-noport
COPY --from=intermediate /opt/liboqs/build-static-noport/tests/test_sig_mem ${INSTALLDIR}/bin/test_sig_mem-noport

COPY scripts/* /opt/test/

# set path to use 'new' openssl. Dyn libs have been properly linked in to match
ENV PATH="${INSTALLDIR}/bin:${PATH}"

# config locations
ENV OPENSSL=${INSTALLDIR}/bin/openssl
ENV OPENSSL_CNF=${INSTALLDIR}/ssl/openssl.cnf

WORKDIR ${INSTALLDIR}

FROM dev
ARG INSTALLDIR

# Enable a normal user to create new server keys off set CA
RUN addgroup --gid 1000 oqs && adduser --system --disabled-password --gid 1000 --uid 1000 oqs && chown -R oqs.oqs /opt/test

# permit changes to liboqs lib by normal oqs user:
RUN chmod gou+rwx /opt/oqssa/lib && chmod gou+rwx /opt/oqssa/lib/*

USER oqs
WORKDIR /opt/test
CMD ["/opt/test/run-tests.sh"]
STOPSIGNAL SIGTERM
