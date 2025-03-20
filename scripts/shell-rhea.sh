#!/bin/bash

docker exec -it $(docker ps -qf "name=timelines[-_]rhea[-_]1") sh
