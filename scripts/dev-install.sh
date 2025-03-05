#!/bin/bash

cd "${0%/*}"
cd ..

. ./scripts/export-user-id.sh && docker compose -f docker-compose.common.yml -f docker-compose.dev.yml up --build -d

(cd app/rhea-backend && yarn prisma:migrate)
exit_code=$?

if [ $exit_code -eq 1 ]; then
   (cd app/rhea-backend && yarn prisma:migrate:dev)

   docker exec $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+") yarn prisma generate
   docker exec $(docker ps -aqf "name=^timelines[-_]rhea[-_][0-9]+") touch src/index.ts
fi

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
