#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines[-_]styx[-_]1") sh
