#!/bin/bash

cd "${0%/*}"

TOTAL='\033[0;36m'
NC='\033[0m'
echo -e "${TOTAL} [[Total]]"
npx cloc ../app/styx-frontend/src/ ../app/rhea-backend/src/ ../shared/src/
echo -e "${NC}"
