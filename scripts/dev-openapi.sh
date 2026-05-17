#!/bin/bash

cd "${0%/*}"
cd ..

(cd app/styx-frontend && npm run openapi)
(cd app/calliope-websockets && npm run openapi)
(cd app/orpheus-mcp && npm run openapi)
