#!/bin/bash

export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)

mkdir -p ./app/styx-frontend/node_modules/.tanstack/tmp-docker
chown -R ${DOCKER_UID}:${DOCKER_GID} ./app/styx-frontend/node_modules/.tanstack/tmp-docker