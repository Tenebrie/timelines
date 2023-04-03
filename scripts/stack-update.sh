docker service scale timelines_rhea=2
docker service update --image tenebrie/timelines-rhea --update-delay 30s timelines_rhea
docker service scale timelines_rhea=1

docker service scale timelines_styx=2
docker service update --image tenebrie/timelines-styx --update-delay 30s timelines_styx
docker service scale timelines_styx=1