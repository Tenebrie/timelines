#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines-styx-1") sh
