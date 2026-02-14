FROM garethgeorge/backrest:v1.11.2

# Install PostgreSQL client for pg_dump, envsubst for config templating, and jq for JSON parsing
USER root
RUN apk add --no-cache postgresql16-client gettext jq

# Copy scripts
COPY scripts/pre-backup.sh /scripts/pre-backup.sh
COPY scripts/backup-tool.sh /scripts/backup-tool.sh
COPY scripts/entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/pre-backup.sh /scripts/backup-tool.sh /scripts/entrypoint.sh

# Copy config template
COPY config.json /config-template/config.json

# Create directories
RUN mkdir -p /data/dumps /config /cache

ENTRYPOINT ["/scripts/entrypoint.sh"]
