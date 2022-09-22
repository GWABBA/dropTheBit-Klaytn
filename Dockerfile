#!/bin/bash
FROM node:16

WORKDIR /usr/src/app

# COPY package*.json ./
COPY . .
ARG SERVER_PORT
ENV SERVER_PORT=9000
ENV CHAIN_NETWORK=klaytn_baobab
RUN npm install

EXPOSE 9000
CMD [ "node", "src/index.js" ]