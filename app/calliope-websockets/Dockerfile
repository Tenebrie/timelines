FROM node:16-alpine

WORKDIR /app/calliope

ADD ./app/calliope-websockets /app/calliope
ADD ./app/ts-shared /app/ts-shared
RUN yarn

EXPOSE 3000
