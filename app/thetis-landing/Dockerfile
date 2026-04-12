FROM node:25-alpine

WORKDIR /app/thetis

COPY ./app/thetis-landing/package.json /app/thetis/
COPY ./app/thetis-landing/yarn.lock /app/thetis/

RUN yarn install

EXPOSE 8081
