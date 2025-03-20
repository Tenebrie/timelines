#!/bin/bash
set -e

# Check if a bucket name was provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <bucket-name>"
  exit 1
fi

BUCKET="$1"

# Dump the database from the Docker container
CONTAINER_ID=$(docker ps -qf "name=timelines[-_]rhea[-_]postgres" | head -n 1)
docker exec "$CONTAINER_ID" bash -c "pg_dump -Udocker db > /backups/db.sql"

# Prep some variables
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_PATH="/mnt/volume_rhea_postgres/backups/db.sql"
UPLOAD_PATH="s3://$BUCKET/rhea/backups/db-$DATE.sql.gz"

gzip -c "$BACKUP_PATH" > "$BACKUP_PATH.gz"

# Sanity check that the backup file exists and is not empty
if [ ! -s "$BACKUP_PATH.gz" ]; then
  echo "Backup file does not exist or is empty."
  exit 1
fi

# Upload the backup to DigitalOcean Spaces
aws s3 cp $BACKUP_PATH.gz $UPLOAD_PATH --endpoint-url https://fra1.digitaloceanspaces.com
echo "Successfully uploaded the latest backup to $UPLOAD_PATH"