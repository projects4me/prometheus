FROM node:14-alpine3.15

EXPOSE 4200
WORKDIR /prometheus


RUN \
	npm install -g ember-cli@4.1.1

COPY . /app

RUN \
    cd /prometheus
    npm install

#run ember server on container start
CMD ["ember", "server"]