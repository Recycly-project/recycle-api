FROM node:18-alpine AS base

WORKDIR /usr/src/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "start-prod" ]