FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

RUN apt-get install git -y

WORKDIR /home/app

COPY main.sh main.sh
COPY src/main.js main.js
COPY package*.json .
COPY .env .env

RUN npm install

COPY src/ /home/app/

RUN chmod +x main.sh
RUN chmod +x main.js

ENTRYPOINT [ "/home/app/main.sh" ]
