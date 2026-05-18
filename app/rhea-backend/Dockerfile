FROM node:24-alpine3.20

ARG DOCKER_UID
ARG DOCKER_GID

# Install ts-shared dependencies
WORKDIR /app/ts-shared
COPY ./app/ts-shared/package.json ./app/ts-shared/package-lock.json* ./
RUN --mount=type=cache,target=/.cache npm install

# Install rhea dependencies
WORKDIR /app/rhea
COPY ./app/rhea-backend/package.json ./app/rhea-backend/package-lock.json* ./
RUN --mount=type=cache,target=/.cache npm install

EXPOSE 3000
