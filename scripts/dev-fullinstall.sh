#!/bin/bash

cd "${0%/*}"
cd ..

npm install
docker compose -f docker-compose.common.yml -f docker-compose.dev.yml stop
docker compose -f docker-compose.common.yml -f docker-compose.dev.yml build
docker compose -f docker-compose.common.yml -f docker-compose.dev.yml up -d --wait
(cd app/rhea-backend && npx prisma migrate dev)
docker compose -f docker-compose.common.yml -f docker-compose.dev.yml up
