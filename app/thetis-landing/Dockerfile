FROM node:24-alpine

WORKDIR /app/thetis

COPY ./app/thetis-landing/package.json /app/thetis/
COPY ./app/thetis-landing/yarn.lock /app/thetis/

RUN yarn install

EXPOSE 8081
