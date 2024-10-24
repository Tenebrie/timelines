if [[ -z "$VERSION" ]]; then
    echo "Must provide VERSION environment" 1>&2
    exit 1
fi


docker stack deploy -c docker-compose.common.yml -c docker-compose.prod.yml timelines