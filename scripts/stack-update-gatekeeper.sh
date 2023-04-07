# Do not update unless necessary.
# Every update recreates an SSL certificate, and Let's Encrypt enforces a limit of 5 per 168 hours.

docker service update --image tenebrie/timelines-gatekeeper --update-delay 30s timelines_gatekeeper