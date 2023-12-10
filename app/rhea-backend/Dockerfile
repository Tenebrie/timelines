FROM node:20-alpine

WORKDIR /app/rhea

ADD ./app/rhea-backend /app/rhea
ADD ./app/ts-shared /app/ts-shared
RUN yarn

EXPOSE 3000
