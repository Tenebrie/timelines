/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import 'module-alias/register'

import moduleAlias from 'module-alias'
import path from 'path'

const ROOT_DIR = path.join(import.meta.dirname, '../')

if (import.meta.dirname.includes('dist')) {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'dist'))
} else {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'src'))
}
