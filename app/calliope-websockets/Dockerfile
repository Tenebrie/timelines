FROM node:22-alpine

WORKDIR /app/ts-shared
ADD ./app/ts-shared /app/ts-shared
RUN --mount=type=cache,target=/.cache yarn

WORKDIR /app/calliope

ADD ./app/calliope-websockets /app/calliope
RUN --mount=type=cache,target=/.cache yarn

EXPOSE 3000
