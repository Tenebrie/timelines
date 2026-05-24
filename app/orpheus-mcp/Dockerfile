FROM node:26-alpine

ARG DOCKER_UID
ARG DOCKER_GID

# Install ts-shared dependencies first
WORKDIR /app/ts-shared
COPY ./app/ts-shared/package.json ./app/ts-shared/package-lock.json* ./
RUN --mount=type=cache,target=/.cache npm install

# Install orpheus dependencies
WORKDIR /app/orpheus
COPY ./app/orpheus-mcp/package.json ./app/orpheus-mcp/package-lock.json* ./
RUN --mount=type=cache,target=/.cache npm install

EXPOSE 3002
