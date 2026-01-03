FROM node:24-alpine3.20

WORKDIR /app/ts-shared

ARG DOCKER_UID
ARG DOCKER_GID

ADD ./app/ts-shared /app/ts-shared
RUN --mount=type=cache,target=/.cache yarn

WORKDIR /app/rhea

ADD ./app/rhea-backend /app/rhea
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./eslint.config.mjs /app/rhea/
RUN --mount=type=cache,target=/.cache yarn

EXPOSE 3000
