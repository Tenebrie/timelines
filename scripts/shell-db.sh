#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines-rhea-postgres") psql -Udocker db
