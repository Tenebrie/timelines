#!/bin/bash
set -e

docker compose -f docker-compose.common.yml -f docker-compose.prod.yml build
docker push tenebrie/timelines-gatekeeper:${VERSION}
docker push tenebrie/timelines-styx:${VERSION}
docker push tenebrie/timelines-rhea:${VERSION}
docker push tenebrie/timelines-calliope:${VERSION}
docker push tenebrie/timelines-orpheus:${VERSION}
docker push tenebrie/timelines-chronos:${VERSION}
echo "\033[38;5;154;48;5;22mPublish successful! Version: \033[0m\033[38;5;226;48;5;22m"${VERSION}"\033[0m"
