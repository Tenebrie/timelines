#!/bin/bash

cd "${0%/*}"
cd ..

rm -rf dist

(cd client && yarn build)
(cd services/gaia && yarn build)

mkdir ./dist
cp -r client/dist dist/client
cp -r services/gaia/dist/* dist
cp services/gaia/package.json dist/services/gaia
cp services/gaia/yarn.lock dist/services/gaia
(cd dist/services/gaia && yarn --prod)

