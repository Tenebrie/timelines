/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import 'module-alias/register'

const path = require('path')
const ROOT_DIR = path.join(__dirname, '../')
const moduleAlias = require('module-alias')
if (__dirname.includes('dist')) {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'dist'))
} else {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'src'))
}
