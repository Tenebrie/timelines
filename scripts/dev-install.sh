#!/bin/bash

cd "${0%/*}"
cd ..

docker cp app/styx-frontend/package.json $(docker ps -aqf "name=^timelines[-_]styx[-_][0-9]+"):/app/styx
docker cp app/styx-frontend/yarn.lock $(docker ps -aqf "name=^timelines[-_]styx[-_][0-9]+"):/app/styx
docker cp app/styx-frontend/tsconfig.json $(docker ps -aqf "name=^timelines[-_]styx[-_][0-9]+"):/app/styx
docker exec $(docker ps -aqf "name=^timelines[-_]styx[-_][0-9]+") yarn

docker cp app/rhea-backend/package.json $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+"):/app/rhea
docker cp app/rhea-backend/yarn.lock $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+"):/app/rhea
docker cp app/rhea-backend/tsconfig.json $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+"):/app/rhea
docker exec $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+") yarn

docker cp app/calliope-websockets/package.json $(docker ps -aqf "name=^timelines[-_]calliope[-_][0-9]+"):/app/calliope
docker cp app/calliope-websockets/yarn.lock $(docker ps -aqf "name=^timelines[-_]calliope[-_][0-9]+"):/app/calliope
docker cp app/calliope-websockets/tsconfig.json $(docker ps -aqf "name=^timelines[-_]calliope[-_][0-9]+"):/app/calliope
docker exec $(docker ps -aqf "name=^timelines[-_]calliope[-_][0-9]+") yarn

(cd app/rhea-backend && yarn prisma:migrate:dev)

docker exec $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+") yarn prisma generate
docker exec $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+") touch src/index.ts

echo "Waiting for Rhea to get up..."
sleep 1
max_retry=30
counter=2
until (curl localhost:3000/health > /dev/null 2>&1);
do
   echo "Rhea not yet ready..."
   sleep 1
   [[ counter -eq $max_retry ]] && exit 1
   ((counter++))
done

cd app/styx-frontend && yarn openapi
