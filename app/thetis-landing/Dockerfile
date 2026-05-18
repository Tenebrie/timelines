FROM node:26-alpine

WORKDIR /app/thetis

COPY ./app/thetis-landing/package.json /app/thetis/
COPY ./app/thetis-landing/package-lock.json /app/thetis/

RUN npm install

EXPOSE 8081
