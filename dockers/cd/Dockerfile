FROM danlynn/ember-cli:4.1.1-node_16.13

ENV ENVIRONMENT="production"

WORKDIR /prometheus

COPY . /prometheus

RUN \
    ls &&\
    cd /prometheus &&\
    npm install -g bower &&\
    bower install &&\
    npm install &&\
    ember build --environment=${ENVIRONMENT} &&\
    mkdir -p ~/.ssh/ &&\
    touch ~/.ssh/known_hosts &&\
    ssh-keyscan -H 64.225.108.167 >> ~/.ssh/known_hosts &&\
    chmod 600 droplet_key 

CMD ["scp", "-i", "droplet_key", "-rp", "dist/", "root@64.225.108.167:/home/web/prometheus/"]