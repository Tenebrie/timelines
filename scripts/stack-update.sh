docker service update --image tenebrie/timelines-rhea --update-delay 30s timelines_rhea
docker service update --image tenebrie/timelines-styx --update-delay 30s timelines_styx
docker service update --image tenebrie/timelines-calliope --update-delay 30s timelines_calliope