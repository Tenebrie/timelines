FROM node:16-alpine

WORKDIR /app/styx

ADD ./app/styx-frontend /app/styx
COPY .prettierrc.js /app/styx
RUN yarn

EXPOSE 8080
