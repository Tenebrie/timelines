FROM node:25-alpine

WORKDIR /app/styx

ARG DOCKER_UID
ARG DOCKER_GID

RUN mkdir /.yarn
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /.yarn
RUN mkdir /.cache
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /.cache
RUN mkdir -p /library/tiptap-schema
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /library

COPY ./app/styx-frontend/package.json /app/styx/
COPY ./app/styx-frontend/yarn.lock /app/styx/

RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /app/styx

USER ${DOCKER_UID}:${DOCKER_GID}
ENV HOME=/
ENV TSR_TMP_DIR=/app/styx/src/node_modules/.tanstack/tmp-docker

# Install ts-shared dependencies first
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./app/ts-shared/package.json ./app/ts-shared/yarn.lock* /app/ts-shared/
RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} (cd /app/ts-shared && yarn install)

# tiptap-schema: bake package.json and tsconfig files; dist is mounted at runtime
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./library/tsconfig.json /library/
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./library/tiptap-schema/package.json /library/tiptap-schema/
COPY --chown=${DOCKER_UID}:${DOCKER_GID} ./library/tiptap-schema/tsconfig.json /library/tiptap-schema/

# Install styx dependencies
RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} yarn install

EXPOSE 8080
