#!/bin/bash

docker exec -it $(docker ps -aqf "name=postgres") psql -Udocker db
