FROM node:24-alpine3.20

WORKDIR /app/ts-shared
ADD ./app/ts-shared /app/ts-shared
RUN --mount=type=cache,target=/.cache yarn

WORKDIR /app/rhea

ADD ./app/rhea-backend /app/rhea
RUN --mount=type=cache,target=/.cache yarn

EXPOSE 3000
