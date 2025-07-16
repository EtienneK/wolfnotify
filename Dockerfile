FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine

ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=/config:/app/config

ENV CACHE_PATH=/app/cache

RUN mkdir -p /config /app/config

WORKDIR /app

COPY --from=build /app/dist .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build \
  /app/config/custom-environment-variables.js  \
  /app/config/default.js \
  /app/config/production.js \
  ./config/

CMD ["node", "./server.js"]
