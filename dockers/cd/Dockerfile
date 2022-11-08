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
    chmod 400 droplet_key.pem &&\
    mkdir -p ~/.ssh/ &&\
    touch ~/.ssh/known_hosts &&\
    ssh-keyscan -H 64.225.108.167 >> ~/.ssh/known_hosts &&\
    scp -i droplet_key.pem -rp droplet_key.pem/ root@64.225.108.167:/home/web/prometheus/