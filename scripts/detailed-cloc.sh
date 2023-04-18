#!/bin/bash

cd "${0%/*}"

STYX='\033[0;33m'
RHEA='\033[0;32m'
CALLIOPE='\033[0;34m'
SHARED='\033[0;31m'
TOTAL='\033[0;36m'

NC='\033[0m'

echo -e "${STYX} [[Styx]]"
npx cloc ../app/styx-frontend/src
echo -e "${NC}"

echo -e "${RHEA} [[Rhea]]"
npx cloc ../app/rhea-backend/src
echo -e "${NC}"

echo -e "${CALLIOPE} [[Calliope]]"
npx cloc ../app/calliope-websockets/src
echo -e "${NC}"

echo -e "${TOTAL} [[Total]]"
npx cloc ../app/styx-frontend/src/ ../app/rhea-backend/src/ ../app/calliope-websockets/src
echo -e "${NC}"

