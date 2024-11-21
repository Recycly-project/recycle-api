FROM node:18-slim

WORKDIR /src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]