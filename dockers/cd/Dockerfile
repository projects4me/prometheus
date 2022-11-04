FROM danlynn/ember-cli:4.1.1-node_16.13

ENV ENVIRONMENT="production"

WORKDIR /prometheus

COPY . /prometheus

RUN \
    ls &&\
    cd /prometheus &&\
    npm install -g bower &&\
    bower install &&\
    npm install


CMD ["ember", "build", "--environment=${ENVIRONMENT}"]