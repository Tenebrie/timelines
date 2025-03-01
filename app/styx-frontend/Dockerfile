FROM node:20-alpine

WORKDIR /app/styx

ARG DOCKER_UID
ARG DOCKER_GID

RUN mkdir /.yarn
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /.yarn

COPY ./app/styx-frontend/package.json /app/styx/
COPY ./app/styx-frontend/yarn.lock /app/styx/

RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /app/styx

USER ${DOCKER_UID}:${DOCKER_GID}
ENV HOME /

RUN --mount=type=cache,target=/.cache,uid=${DOCKER_UID},gid=${DOCKER_GID} yarn

COPY ./app/styx-frontend/tsconfig.json /app/styx/
COPY ./app/styx-frontend/jest.config.ts /app/styx/
COPY ./app/styx-frontend/vite.config.ts /app/styx/
COPY ./app/styx-frontend/index.html /app/styx/
ADD ./app/ts-shared /app/ts-shared
COPY .prettierrc.js /app/styx

EXPOSE 8080
