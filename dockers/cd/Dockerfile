FROM danlynn/ember-cli:4.1.1-node_16.13

ENV ENVIRONMENT="production"
ARG HOST

WORKDIR /prometheus

COPY . /prometheus

RUN \
    ls &&\
    # cd /prometheus &&\
    # npm install -g bower &&\
    # bower install &&\
    # npm install &&\
    # ember build --environment=${ENVIRONMENT} &&\
    scp -i droplet_key -rp droplet_key/ $HOST@64.225.108.167:/home/web/prometheus/