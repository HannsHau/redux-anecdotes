# syntax = docker/dockerfile:1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM base
# Copy production node_modules, server.js, and dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/dist /app/dist
COPY --from=build /app/db.json /app/db.json
EXPOSE 3000
CMD ["node", "server.js"]

