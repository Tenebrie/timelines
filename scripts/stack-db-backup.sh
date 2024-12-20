#!/bin/bash

docker exec $(docker ps -aqf "name=timelines_rhea-postgres") bash -c "pg_dump -Udocker db > /backups/db.sql"
# Rename the file to include the current date and time
mv /mnt/volume_rhea_postgres/backups/db.sql /mnt/volume_rhea_postgres/backups/db-$(date +%Y-%m-%d_%H-%M).sql
# Delete files older than 7 days
find /mnt/volume_rhea_postgres/backups/ -type f -name '*.sql' -mtime +7 -exec rm {} \;
