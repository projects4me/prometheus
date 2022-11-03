FROM danlynn/ember-cli:4.1.1-node_16.13

WORKDIR /prometheus

COPY . /prometheus/

RUN \
    cd /prometheus

CMD ["npm", "install"]
CMD ["bower", "install"]
CMD ["ember", "test"]