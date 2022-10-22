#!/bin/bash

(cd "$(dirname "$0")" && cd ../services/gaia && npx node-pg-migrate create "$@")
