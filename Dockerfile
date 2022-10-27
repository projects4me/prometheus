FROM node:14-alpine3.15

#ember listens port 4200
EXPOSE 4200
WORKDIR /prometheus

#install git and openssh in node alpine version to fetch package from git repo
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

#install ember cli
RUN \
	npm install -g ember-cli@4.1.1

#copy all files and directories into current working directory
COPY . /prometheus

#install dependencies
RUN \
    cd /prometheus &&\
    ls &&\
    npm install &&\
    npm install -g bower &&\
    bower install

#run ember server on container start
CMD ["ember", "server"]