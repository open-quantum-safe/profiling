# Multi-stage build: First the full builder image:

# define the Curl version to be baked in
ARG CURL_VERSION=7.69.1

# define the S3FS version to be baked in
ARG S3FS_VERSION=1.82

# Default location where all binaries wind up:
ARG INSTALLDIR=/opt/oqssa

# liboqs build defines (https://github.com/open-quantum-safe/liboqs/wiki/Customizing-liboqs)
ARG LIBOQS_BUILD_DEFINES=

# openssl build defines (https://github.com/open-quantum-safe/openssl#build-options)
ARG OPENSSL_BUILD_DEFINES="-DOQS_DEFAULT_GROUPS=p384_kyber768:X25519:kyber768:newhope1024cca"

# Default root CA signature algorithm; can be set to any listed at https://github.com/open-quantum-safe/openssl#authentication
ARG SIG_ALG="dilithium2"

# Define the degree of parallelism when building the image; leave the number away only if you know what you are doing
ARG MAKE_DEFINES="-j 2"


FROM alpine:3.11 as intermediate
# Take in all global args
ARG CURL_VERSION
ARG S3FS_VERSION
ARG INSTALLDIR
ARG LIBOQS_BUILD_DEFINES
ARG OPENSSL_BUILD_DEFINES
ARG SIG_ALG
ARG MAKE_DEFINES

LABEL version="2"

ENV DEBIAN_FRONTEND noninteractive

RUN apk update && apk upgrade

# Get all software packages required for builing all components:
RUN apk add build-base linux-headers \
            libtool automake autoconf cmake \
            make \
            openssl openssl-dev \
            git docker wget fuse fuse-dev curl-dev libxml2-dev

# get all sources
WORKDIR /opt
RUN git clone --depth 1 --branch master https://github.com/open-quantum-safe/liboqs && \
    git clone --depth 1 --branch OQS-OpenSSL_1_1_1-stable https://github.com/open-quantum-safe/openssl ossl-src && \
    wget https://curl.haxx.se/download/curl-${CURL_VERSION}.tar.gz && tar -zxvf curl-${CURL_VERSION}.tar.gz && \
    wget https://github.com/s3fs-fuse/s3fs-fuse/archive/v${S3FS_VERSION}.tar.gz && tar -xzvf v${S3FS_VERSION}.tar.gz

# Add curl patchfile
ADD patch-${CURL_VERSION}.oqs.txt /opt/patch-${CURL_VERSION}.oqs.txt

# build s3fs:
WORKDIR /opt/s3fs-fuse-${S3FS_VERSION}
RUN ./autogen.sh && ./configure --prefix=/usr && make && make install

RUN s3fs --version

# build liboqs shared and static
WORKDIR /opt/liboqs
RUN mkdir build && cd build && cmake .. ${LIBOQS_BUILD_DEFINES} -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_PREFIX=/opt/ossl-src/oqs && make ${MAKE_DEFINES} && make install
RUN mkdir build-static && cd build-static && cmake .. -DCMAKE_BUILD_TYPE=${LIBOQS_BUILD_TYPE} -DBUILD_SHARED_LIBS=OFF -DCMAKE_INSTALL_PREFIX=/opt/ossl-src/oqs && make ${MAKE_DEFINES} && make install

# build OQS-OpenSSL
WORKDIR /opt/ossl-src
# curl looks for shared libraries
# at ./configure time
RUN LDFLAGS="-Wl,-rpath -Wl,${INSTALLDIR}/lib" ./config shared ${OPENSSL_BUILD_DEFINES} --prefix=${INSTALLDIR} && \
    make ${MAKE_DEFINES} && make install;

# set path to use 'new' openssl & curl. Dyn libs have been properly linked in to match
ENV PATH="${INSTALLDIR}/bin:${PATH}"

# generate certificates for openssl s_server, which is what we will test curl against
ENV OPENSSL=${INSTALLDIR}/bin/openssl
ENV OPENSSL_CNF=${INSTALLDIR}/ssl/openssl.cnf

WORKDIR ${INSTALLDIR}/bin
RUN set -x && \
    # generate CA key and cert
    ${OPENSSL} req -x509 -new -newkey ${SIG_ALG} -keyout CA.key -out CA.crt -nodes -subj "/CN=oqstest CA" -days 365 -config ${OPENSSL_CNF} 

# build curl - injecting OQS CA generated above into root store
WORKDIR /opt/curl-${CURL_VERSION}
RUN patch -p1 < /opt/patch-${CURL_VERSION}.oqs.txt

# Download and integrate LetsEncrypt Root CA to CA bundle
RUN wget https://letsencrypt.org/certs/letsencryptauthorityx3.pem.txt && cat ${INSTALLDIR}/bin/CA.crt >> letsencryptauthorityx3.pem.txt 

# For curl debugging enable it by adding the line below to the configure command:
#                    --enable-debug \

RUN env CPPFLAGS="-I/opt/ossl-src/oqs/include" \
        LDFLAGS=-Wl,-R${INSTALLDIR}/lib  \
        ./configure --prefix=${INSTALLDIR} \
                    --with-ca-bundle=${INSTALLDIR}/oqs-bundle.pem \
                    --with-ssl=${INSTALLDIR} && \
    make ${MAKE_DEFINES} && make install && mv letsencryptauthorityx3.pem.txt ${INSTALLDIR}/oqs-bundle.pem;

# Download current test.openquantumsafe.org test CA cert
WORKDIR ${INSTALLDIR}
RUN wget https://test.openquantumsafe.org/CA.crt && mv CA.crt oqs-testca.pem

WORKDIR /

## second stage: Only create minimal image without build tooling and intermediate build results generated above:
FROM alpine:3.11 as dev
# Take in all global args
ARG INSTALLDIR
ARG SIG_ALG

# Dependencies for logfile analysis and S3FS:
RUN apk add python3 fuse libxml2 curl libstdc++6 git && ln -s /usr/lib/gcc/x86_64-alpine-linux-musl/6.4.0/libstdc\+\+.so.6 /usr/lib/libstdc\+\+.so.6 && rm -rf /var/cache/apk/*;

# Move s3fs over...
COPY --from=intermediate /usr/bin/s3fs /usr/bin/s3fs
# Retain the ${INSTALLDIR} contents in the final image
COPY --from=intermediate ${INSTALLDIR} ${INSTALLDIR}
# Also retain liboqs speed-executables
COPY --from=intermediate /opt/liboqs/build-static/tests/speed_kem ${INSTALLDIR}/bin/speed_kem
COPY --from=intermediate /opt/liboqs/build-static/tests/speed_sig ${INSTALLDIR}/bin/speed_sig

# set path to use 'new' openssl & curl. Dyn libs have been properly linked in to match
ENV PATH="${INSTALLDIR}/bin:${PATH}"

# config locations
ENV OPENSSL=${INSTALLDIR}/bin/openssl
ENV OPENSSL_CNF=${INSTALLDIR}/ssl/openssl.cnf

WORKDIR ${INSTALLDIR}/bin

RUN set -x && mkdir /opt/test 

COPY scripts/* /opt/test/
# ToDo: Add further test scripts here

WORKDIR ${INSTALLDIR}

FROM dev
ARG INSTALLDIR

# Enable a normal user to create new server keys off set CA
RUN addgroup -g 1000 -S oqs && adduser --uid 1000 -S oqs -G oqs && chown -R oqs.oqs /opt/test 

USER oqs
WORKDIR /opt/test
CMD ["/opt/test/run-tests.sh"]
STOPSIGNAL SIGTERM
