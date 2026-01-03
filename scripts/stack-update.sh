#!/bin/bash
set -e

if [[ -z "$VERSION" ]]; then
  echo "Must provide VERSION environment" 1>&2
  exit 1
fi

docker system prune -f

SERVICES=("timelines_rhea" "timelines_calliope" "timelines_styx")
IMAGES=(
  "tenebrie/timelines-rhea:${VERSION}"
  "tenebrie/timelines-calliope:${VERSION}"
  "tenebrie/timelines-styx:${VERSION}"
)

for i in "${!SERVICES[@]}"; do
  docker service update --image "${IMAGES[$i]}" "${SERVICES[$i]}" &
done

wait

# Wait for all services to finish updating
echo "Waiting for rollouts to complete..."
for svc in "${SERVICES[@]}"; do
  while true; do
    STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
    if [[ "$STATE" != "updating" ]]; then
      break
    fi
    sleep 2
  done
done

FAILED=false
for svc in "${SERVICES[@]}"; do
  STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
  if [[ "$STATE" != "completed" ]]; then
    echo "FAILED: $svc state is $STATE"
    echo "--- $svc task history ---"
    docker service ps "$svc" --no-trunc --format "table {{.Name}}\t{{.CurrentState}}\t{{.Error}}"
    echo "--- $svc recent logs ---"
    docker service logs --tail 100 "$svc" 2>&1 || true
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

docker service update --image "tenebrie/timelines-gatekeeper:${VERSION}" "timelines_gatekeeper"

echo "All services updated successfully"
docker system prune -f