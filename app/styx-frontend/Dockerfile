FROM node:22-alpine

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
ENV HOME /

ADD --chown=${DOCKER_UID}:${DOCKER_GID} ./app/ts-shared /app/ts-shared
RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} (cd /app/ts-shared && yarn)

RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} yarn

COPY --chown=${DOCKER_UID}:${DOCKER_GID} .prettierrc.js /app/styx

COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/styx-frontend/eslint.config.mjs /app/styx/
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/styx-frontend/index.html /app/styx/
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/styx-frontend/jest.config.ts /app/styx/
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/styx-frontend/tsconfig.json /app/styx/
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/styx-frontend/vite.config.ts /app/styx/

EXPOSE 8080
