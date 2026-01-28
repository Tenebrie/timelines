#!/bin/bash

cd "${0%/*}"
cd ..

(cd app/styx-frontend && yarn openapi)
(cd app/calliope-websockets && yarn openapi)
