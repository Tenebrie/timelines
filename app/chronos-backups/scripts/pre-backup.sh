#!/bin/bash
set -e

echo "Starting PostgreSQL backup..."

# Create timestamped dump in the backup folder
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
DUMP_DIR="/data/backup"
DUMP_FILE="${DUMP_DIR}/db-${TIMESTAMP}.sql"

mkdir -p "${DUMP_DIR}"

# Dump the database using pg_dump over the network
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${POSTGRES_HOST}" \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --no-owner \
    --no-acl \
    > "${DUMP_FILE}"

# Verify the dump is not empty
if [ ! -s "${DUMP_FILE}" ]; then
    echo "ERROR: Database dump is empty!"
    exit 1
fi

# Keep only the latest dump (restic handles versioning)
# Remove older dumps to save local space
find "${DUMP_DIR}" -name "db-*.sql" -type f ! -name "$(basename ${DUMP_FILE})" -delete

echo "PostgreSQL backup completed: ${DUMP_FILE}"
echo "Dump size: $(du -h ${DUMP_FILE} | cut -f1)"
