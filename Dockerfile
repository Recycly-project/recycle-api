FROM node:20 AS base

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y libssl1.1

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/server.js"]