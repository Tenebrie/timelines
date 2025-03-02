#!/bin/bash

docker exec -it $(docker ps -aqf "name=timelines[-_]calliope[-_]1") sh
