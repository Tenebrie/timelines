#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines[-_]rhea[-_]postgres") psql -Udocker db
