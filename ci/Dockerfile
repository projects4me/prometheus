FROM danlynn/ember-cli:4.1.1-node_16.13

WORKDIR /prometheus

COPY . /prometheus/

RUN \
    cd .. &&\
    ls &&\
    cd prometheus &&\
    ls
    # npm install -g bower &&\
    # bower install &&\
    # npm install


CMD ["ember", "test"]