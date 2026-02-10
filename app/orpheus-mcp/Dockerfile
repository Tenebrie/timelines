FROM node:24-alpine

ARG DOCKER_UID
ARG DOCKER_GID

# Install ts-shared dependencies first
WORKDIR /app/ts-shared
COPY ./app/ts-shared/package.json ./app/ts-shared/yarn.lock* ./
RUN --mount=type=cache,target=/.cache yarn install

# Install orpheus dependencies
WORKDIR /app/orpheus
COPY ./app/orpheus-mcp/package.json ./app/orpheus-mcp/yarn.lock* ./
RUN --mount=type=cache,target=/.cache yarn install

EXPOSE 3002
