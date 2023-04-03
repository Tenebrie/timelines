docker service update --image 127.0.0.1:5000/gatekeeper --update-delay 30s timelines_gatekeeper
docker service update --image 127.0.0.1:5000/rhea --update-delay 30s timelines_rhea
docker service update --image 127.0.0.1:5000/styx --update-delay 30s timelines_styx