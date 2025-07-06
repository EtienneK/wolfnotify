# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine

ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=/config:/app/config

RUN mkdir -p /config /app/config

WORKDIR /app

COPY --from=build /app/dist .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/config/*.js ./config/

CMD ["node", "./index.js"]
