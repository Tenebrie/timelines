mkdir -p /mnt/volume_rhea_postgres/data
docker exec -it $(docker ps -qf "name=timelines_rhea.1") bash
DATABASE_URL=postgresql://docker:docker@rhea-postgres:5432/db?schema=public yarn prisma migrate deploy