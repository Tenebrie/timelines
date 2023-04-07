docker service update --image tenebrie/timelines-rhea:${VERSION} --update-delay 30s timelines_rhea
docker service update --image tenebrie/timelines-styx:${VERSION} --update-delay 30s timelines_styx
docker service update --image tenebrie/timelines-calliope:${VERSION} --update-delay 30s timelines_calliope