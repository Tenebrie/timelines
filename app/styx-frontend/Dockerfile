FROM node:20-alpine

WORKDIR /app/styx

ADD ./app/styx-frontend /app/styx
ADD ./app/ts-shared /app/ts-shared
COPY .prettierrc.js /app/styx

ARG DOCKER_UID
ARG DOCKER_GID
RUN chown -R ${DOCKER_UID}:${DOCKER_GID} /app
USER ${DOCKER_UID}:${DOCKER_GID}

ENV HOME /

RUN yarn

EXPOSE 8080
