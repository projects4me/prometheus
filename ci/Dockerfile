FROM danlynn/ember-cli:4.1.1-node_16.13

WORKDIR /prometheus

RUN \
    ls &&\
    cd .. &&\
    cd prometheus &&\
    echo "into prometheus" &&\
    ls
    # npm install -g bower &&\
    # bower install &&\
    # npm install


CMD ["ember", "test"]