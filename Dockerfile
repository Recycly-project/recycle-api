FROM node:18-alpine AS base

# Tambahkan OpenSSL
RUN apk add libssl1.1 && apk del libssl1.1

# Install dependencies dan build aplikasi
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "src/server.js"]