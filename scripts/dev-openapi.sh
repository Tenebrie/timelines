#!/bin/bash

cd "${0%/*}"
cd ..

(cd app/styx-frontend && npm run openapi)
(cd library/openapi-fetch && npm run openapi)
