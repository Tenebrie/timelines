FROM node:20-alpine

WORKDIR /app/styx

ADD ./app/styx-frontend /app/styx
ADD ./app/ts-shared /app/ts-shared
COPY .prettierrc.js /app/styx
RUN yarn

EXPOSE 8080
