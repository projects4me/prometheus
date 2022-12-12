FROM rananoman/prometheus:1.0.0

WORKDIR /prometheus

COPY . /prometheus

CMD ["ember", "serve"]