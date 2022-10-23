#!/bin/bash

docker exec -it $(docker ps -aqf "name=rhea-db") psql -Udocker db
