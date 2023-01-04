FROM node:18-alpine as build
WORKDIR /usr/src/app

# install dependencies (including dev)
COPY --chown=node:node package*.json ./
COPY --chown=node:node api/package*.json api/
COPY --chown=node:node client/package*.json client/
RUN npm install

# build applications
COPY --chown=node:node . .
RUN npm run build

USER node

FROM node:18-alpine
WORKDIR /usr/src/app

# install api dependencies only
COPY --chown=node:node api/package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node --from=build /usr/src/app/api/dist ./dist

ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
