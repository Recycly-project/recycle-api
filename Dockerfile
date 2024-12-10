# Development Stage
FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

# Production Stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=development /usr/src/app /usr/src/app

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
