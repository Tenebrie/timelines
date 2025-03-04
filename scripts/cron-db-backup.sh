#!/bin/bash
set -e

# Read the environment secret
ENV=$(cat /run/secrets/environment)

if [ "$ENV" == "staging" ]; then
  BUCKET="timelines-staging"
else
  BUCKET="timelines-prod"
fi

/bin/sh /scripts/stack-create-db-backup.sh $BUCKET