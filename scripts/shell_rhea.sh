#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines-rhea-1") bash
