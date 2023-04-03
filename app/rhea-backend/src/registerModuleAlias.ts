import 'module-alias/register'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
const ROOT_DIR = path.join(__dirname, '../')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moduleAlias = require('module-alias')
if (__dirname.includes('dist')) {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'dist'))
} else {
	moduleAlias.addAlias('@src', path.join(ROOT_DIR, 'src'))
}
