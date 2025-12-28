#!/bin/bash

docker exec -it $(docker ps -qf "name=timelines[-_]styx[-_]1") sh
