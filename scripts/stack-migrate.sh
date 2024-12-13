mkdir -p /mnt/volume_rhea_postgres/data
mkdir -p /mnt/volume_rhea_postgres/backups
DATABASE_URL=postgresql://docker:docker@rhea-postgres:5432/db?schema=public docker exec $(docker ps -qf "name=timelines_rhea.1") yarn prisma migrate deploy