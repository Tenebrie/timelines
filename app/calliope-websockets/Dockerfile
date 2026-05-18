FROM node:26-alpine

ARG DOCKER_UID
ARG DOCKER_GID

RUN mkdir -p /library/tiptap-schema

# Install ts-shared dependencies first
WORKDIR /app/ts-shared
COPY ./app/ts-shared/package.json ./app/ts-shared/package-lock.json* ./
RUN --mount=type=cache,target=/.cache npm install

# Tiptap Schema library
WORKDIR /library/tiptap-schema
COPY ./library/tsconfig.json /library/
COPY ./library/tiptap-schema/package.json ./library/tiptap-schema/package-lock.json* ./
COPY ./library/tiptap-schema/tsconfig.json ./
RUN --mount=type=cache,target=/.cache npm install

# Install calliope dependencies
WORKDIR /app/calliope
COPY ./app/calliope-websockets/package.json ./app/calliope-websockets/package-lock.json* ./
RUN --mount=type=cache,target=/.cache npm install

EXPOSE 3000
