FROM node:18-alpine AS base

# Tambahkan OpenSSL
RUN apk add libssl1.1 && apk del libssl1.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/server.js"]