#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines_rhea-postgres") psql -Udocker db
