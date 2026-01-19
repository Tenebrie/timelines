FROM node:24-alpine

ARG DOCKER_UID
ARG DOCKER_GID

# Install ts-shared dependencies first
WORKDIR /app/ts-shared
COPY ./app/ts-shared/package.json ./app/ts-shared/yarn.lock* ./
RUN --mount=type=cache,target=/.cache yarn install

# Install calliope dependencies
WORKDIR /app/calliope
COPY ./app/calliope-websockets/package.json ./app/calliope-websockets/yarn.lock* ./
RUN --mount=type=cache,target=/.cache yarn install

EXPOSE 3000
