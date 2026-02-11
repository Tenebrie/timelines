#!/bin/bash
set -e

# Read S3 credentials from Docker Swarm secrets (prod) or environment variables (dev)
if [ -f /run/secrets/s3-access-key-id ]; then
    # Production: read from secrets
    export AWS_ACCESS_KEY_ID=$(cat /run/secrets/s3-access-key-id)
    export AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/s3-access-key-secret)
    S3_BUCKET=$(cat /run/secrets/s3-bucket-id)
    S3_ENDPOINT=$(cat /run/secrets/s3-endpoint)
else
    # Development: read from environment variables
    export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
    export AWS_SECRET_ACCESS_KEY="${S3_ACCESS_KEY_SECRET}"
    S3_BUCKET="${S3_BUCKET}"
    S3_ENDPOINT="${S3_ENDPOINT}"
fi

export RESTIC_PASSWORD="timelines-backups"

# Convert endpoint to restic S3 format
# Restic needs: s3:http://host:port/bucket or s3:https://host/bucket
if echo "$S3_ENDPOINT" | grep -q "^http://"; then
    # HTTP (e.g., MinIO in dev): s3:http://s3-minio:9000/bucket/backrest
    export RESTIC_REPOSITORY="s3:${S3_ENDPOINT}/${S3_BUCKET}/backrest"
else
    # HTTPS (e.g., DigitalOcean Spaces): s3:s3.region.digitaloceanspaces.com/bucket/backrest
    S3_HOST=$(echo "$S3_ENDPOINT" | sed 's|https://||')
    export RESTIC_REPOSITORY="s3:${S3_HOST}/${S3_BUCKET}/backrest"
fi

echo "Backrest starting..."
echo "Repository: ${RESTIC_REPOSITORY}"
echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}"

# Ensure directories exist
mkdir -p /data/backup /data/restore /config /cache

# Generate config from template if it doesn't exist yet
if [ ! -f /config/config.json ]; then
    echo "No config found, generating from template..."
    envsubst < /config-template/config.json > /config/config.json
else
    echo "Using existing config from /config/config.json"
fi

# Initialize the restic repository if it doesn't exist
echo "Checking if repository exists..."
if ! restic -r "${RESTIC_REPOSITORY}" snapshots 2>/dev/null; then
    echo "Initializing new restic repository..."
    restic -r "${RESTIC_REPOSITORY}" init
fi

echo "Starting backrest server..."
# Start backrest
exec /backrest
