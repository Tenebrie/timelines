#!/bin/bash
set -e

if [[ -z "$VERSION" ]]; then
    echo "Must provide VERSION environment" 1>&2
    exit 1
fi

SERVICES=("timelines_rhea" "timelines_calliope" "timelines_styx" "timelines_gatekeeper")
IMAGES=(
  "tenebrie/timelines-rhea:${VERSION}"
  "tenebrie/timelines-calliope:${VERSION}"
  "tenebrie/timelines-styx:${VERSION}"
  "tenebrie/timelines-gatekeeper:${VERSION}"
)

# Update all in parallel, pause on failure
for i in "${!SERVICES[@]}"; do
  docker service update \
    --image "${IMAGES[$i]}" \
    "${SERVICES[$i]}" &
done

wait

# Check results
FAILED=false
for svc in "${SERVICES[@]}"; do
  STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
  if [[ "$STATE" != "completed" ]]; then
    echo "FAILED: $svc state is $STATE"
    FAILED=true
  fi
done

if $FAILED; then
  echo "Rolling back all services..."
  for svc in "${SERVICES[@]}"; do
    docker service update --rollback "$svc" &
  done
  wait
  exit 1
fi

echo "All services updated successfully"
docker system prune -f