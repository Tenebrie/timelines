FROM node:24-alpine

WORKDIR /app/styx

ARG DOCKER_UID
ARG DOCKER_GID

RUN mkdir /.yarn
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /.yarn
RUN mkdir /.cache
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /.cache

COPY ./app/styx-frontend/package.json /app/styx/
COPY ./app/styx-frontend/yarn.lock /app/styx/

RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /app/styx

USER ${DOCKER_UID}:${DOCKER_GID}
ENV HOME=/
ENV TSR_TMP_DIR=/app/styx/src/node_modules/.tanstack/tmp-docker

# Install ts-shared dependencies first
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/ts-shared/package.json ./app/ts-shared/yarn.lock* /app/ts-shared/
RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} (cd /app/ts-shared && yarn install)

# Install styx dependencies
RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} yarn install

EXPOSE 8080
