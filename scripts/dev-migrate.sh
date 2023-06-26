#!/bin/bash

cd "${0%/*}"
cd ..

(cd app/rhea-backend && yarn prisma:migrate:dev)
docker exec -it $(docker ps -aqf "name=^timelines-rhea-[0-9]+") yarn prisma generate
docker exec -it $(docker ps -aqf "name=^timelines-rhea-[0-9]+") touch src/index.ts

echo "Waiting a few seconds for Rhea to get up..."
sleep 5
max_retry=7
counter=2
until (cd app/styx-frontend && yarn openapi)
do
   sleep 5
   [[ counter -eq $max_retry ]] && exit 1
   echo "Trying again. Try #$counter"
   ((counter++))
done
