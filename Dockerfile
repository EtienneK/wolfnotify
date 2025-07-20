FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/dist .
COPY --from=build /app/static ./static
COPY --from=build /app/node_modules ./node_modules

CMD ["node", "./server.js"]
