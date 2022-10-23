#!/bin/bash

docker exec -it $(docker ps -aqf "name=rhea") bash
