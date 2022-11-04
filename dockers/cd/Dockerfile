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
    ember build --environment=${ENVIRONMENT}


CMD ["ember", "-v"]