#!/bin/bash
set -e
cd "${0%/*}"
SCRIPT_DIR="$(pwd)"

VERSION="${1:?Usage: $0 <version>}"

rm -rf /tmp/neverkin/exportSchema
npx tsc --project ./tsconfig.export.json --outDir /tmp/neverkin/exportSchema --noCheck
npx tsx ./scripts/exportSchemaPreprocess.ts /tmp/neverkin/exportSchema/src/services/DataMigrationService.d.ts /tmp/neverkin/exportSchema/schema.d.ts "$VERSION"
(cd /tmp/neverkin/exportSchema && "$SCRIPT_DIR/../node_modules/.bin/ts-to-zod" --skipValidation schema.d.ts zodSchema.ts)
mv /tmp/neverkin/exportSchema/zodSchema.ts ../src/services/DataMigrationService.schema.ts
npx eslint --fix ./src/services/DataMigrationService.schema.ts