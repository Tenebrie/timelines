if [[ -z "$VERSION" ]]; then
    echo "Must provide VERSION environment" 1>&2
    exit 1
fi

docker service update --image tenebrie/timelines-gatekeeper:${VERSION} --update-delay 5s --update-parallelism 1 --update-failure-action rollback timelines_gatekeeper
docker service update --image tenebrie/timelines-rhea:${VERSION} --update-delay 5s --update-parallelism 1 --update-failure-action rollback timelines_rhea
docker service update --image tenebrie/timelines-calliope:${VERSION} --update-delay 5s --update-parallelism 1 --update-failure-action rollback timelines_calliope
docker service update --image tenebrie/timelines-styx:${VERSION} --update-delay 5s --update-parallelism 1 --update-failure-action rollback timelines_styx
docker system prune -f