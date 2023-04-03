docker compose -f docker-compose.common.yml -f docker-stack.yml build styx
docker compose -f docker-compose.common.yml -f docker-stack.yml build rhea
docker compose -f docker-compose.common.yml -f docker-stack.yml build
docker compose -f docker-compose.common.yml -f docker-stack.yml push