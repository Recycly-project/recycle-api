FROM node:18-alpine AS base

# Tambahkan OpenSSL
RUN apt-get update && apt-get install -y libssl1.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/server.js"]