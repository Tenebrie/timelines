docker compose -f docker-compose.common.yml -f docker-compose.prod.yml build styx
docker compose -f docker-compose.common.yml -f docker-compose.prod.yml build rhea
docker compose -f docker-compose.common.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.common.yml -f docker-compose.prod.yml push