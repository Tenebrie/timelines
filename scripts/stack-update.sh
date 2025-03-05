#!/bin/bash
set -e

if [[ -z "$VERSION" ]]; then
    echo "Must provide VERSION environment" 1>&2
    exit 1
fi

docker service update --image tenebrie/timelines-gatekeeper:${VERSION} timelines_gatekeeper
docker service update --image tenebrie/timelines-rhea:${VERSION} timelines_rhea
docker service update --image tenebrie/timelines-calliope:${VERSION} timelines_calliope
docker service update --image tenebrie/timelines-styx:${VERSION} timelines_styx

docker system prune -f