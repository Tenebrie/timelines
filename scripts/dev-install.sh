#!/bin/bash

cd "${0%/*}"
cd ..

docker cp app/styx-frontend/package.json $(docker ps -aqf "name=^timelines-styx-[0-9]+"):/app/styx
docker cp app/styx-frontend/yarn.lock $(docker ps -aqf "name=^timelines-styx-[0-9]+"):/app/styx
docker exec -it $(docker ps -aqf "name=^timelines-styx-[0-9]+") yarn

docker cp app/rhea-backend/package.json $(docker ps -aqf "name=^timelines-rhea-[0-9]+"):/app/rhea
docker cp app/rhea-backend/yarn.lock $(docker ps -aqf "name=^timelines-rhea-[0-9]+"):/app/rhea
docker exec -it $(docker ps -aqf "name=^timelines-rhea-[0-9]+") yarn

docker cp app/calliope-websockets/package.json $(docker ps -aqf "name=^timelines-calliope-[0-9]+"):/app/calliope
docker cp app/calliope-websockets/yarn.lock $(docker ps -aqf "name=^timelines-calliope-[0-9]+"):/app/calliope
docker exec -it $(docker ps -aqf "name=^timelines-calliope-[0-9]+") yarn

docker exec -it $(docker ps -aqf "name=^timelines-rhea-[0-9]+") yarn prisma generate
docker exec -it $(docker ps -aqf "name=^timelines-rhea-[0-9]+") touch src/index.ts
