FROM node:24-alpine

WORKDIR /app/ts-shared

ARG DOCKER_UID
ARG DOCKER_GID

ADD ./app/ts-shared /app/ts-shared
RUN --mount=type=cache,target=/.cache yarn

WORKDIR /app/calliope

ADD ./app/calliope-websockets /app/calliope
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./eslint.config.mjs /app/calliope/
RUN --mount=type=cache,target=/.cache yarn

EXPOSE 3000
