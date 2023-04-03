docker service scale timelines_gatekeeper=2
docker service update --image 127.0.0.1:5000/gatekeeper --update-delay 30s timelines_gatekeeper
docker service scale timelines_gatekeeper=1

docker service scale timelines_rhea=2
docker service update --image 127.0.0.1:5000/rhea --update-delay 30s timelines_rhea
docker service scale timelines_rhea=1

docker service scale timelines_styx=2
docker service update --image 127.0.0.1:5000/styx --update-delay 30s timelines_styx
docker service scale timelines_styx=1