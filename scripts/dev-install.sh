#!/bin/bash

cd "${0%/*}"
cd ..

docker cp app/styx-frontend/package.json $(docker ps -aqf "name=^timelines-styx-[0-9]+"):/app/styx
docker cp app/styx-frontend/yarn.lock $(docker ps -aqf "name=^timelines-styx-[0-9]+"):/app/styx
docker cp app/styx-frontend/tsconfig.json $(docker ps -aqf "name=^timelines-styx-[0-9]+"):/app/styx
docker exec $(docker ps -aqf "name=^timelines-styx-[0-9]+") yarn

docker cp app/rhea-backend/package.json $(docker ps -aqf "name=^timelines-rhea-[0-9]+"):/app/rhea
docker cp app/rhea-backend/yarn.lock $(docker ps -aqf "name=^timelines-rhea-[0-9]+"):/app/rhea
docker cp app/rhea-backend/tsconfig.json $(docker ps -aqf "name=^timelines-rhea-[0-9]+"):/app/rhea
docker exec $(docker ps -aqf "name=^timelines-rhea-[0-9]+") yarn

docker cp app/calliope-websockets/package.json $(docker ps -aqf "name=^timelines-calliope-[0-9]+"):/app/calliope
docker cp app/calliope-websockets/yarn.lock $(docker ps -aqf "name=^timelines-calliope-[0-9]+"):/app/calliope
docker cp app/calliope-websockets/tsconfig.json $(docker ps -aqf "name=^timelines-calliope-[0-9]+"):/app/calliope
docker exec $(docker ps -aqf "name=^timelines-calliope-[0-9]+") yarn

docker exec $(docker ps -aqf "name=^timelines-rhea-[0-9]+") yarn prisma generate
docker exec $(docker ps -aqf "name=^timelines-rhea-[0-9]+") touch src/index.ts

echo "Waiting a few seconds for Rhea to get up..."
sleep 5
echo "The request may fail, do not panic"
sleep 1
max_retry=7
counter=2
until (cd app/styx-frontend && yarn openapi)
do
   echo "Trying again. Try #$counter"
   sleep 5
   [[ counter -eq $max_retry ]] && exit 1
   ((counter++))
done

(cd app/rhea-backend && yarn prisma:migrate:dev)
