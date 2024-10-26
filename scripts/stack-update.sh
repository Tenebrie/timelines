if [[ -z "$VERSION" ]]; then
    echo "Must provide VERSION environment" 1>&2
    exit 1
fi

docker service update --image tenebrie/timelines-gatekeeper:${VERSION} --update-delay 5s timelines_gatekeeper
docker service update --image tenebrie/timelines-styx:${VERSION} --update-delay 5s timelines_styx
docker service update --image tenebrie/timelines-rhea:${VERSION} --update-delay 5s timelines_rhea
docker service update --image tenebrie/timelines-calliope:${VERSION} --update-delay 5s timelines_calliope
docker system prune -f