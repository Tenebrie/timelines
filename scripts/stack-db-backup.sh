#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines_rhea-postgres") bash -c "pg_dump -Udocker db > /backups/db.sql"
