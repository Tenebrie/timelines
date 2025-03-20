#!/bin/bash

docker exec -it $(docker ps -qf "name=timelines[-_]calliope[-_]1") sh
