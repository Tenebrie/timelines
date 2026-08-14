import { createRequire } from 'node:module'

import stub from './sharp-stub.mjs'

/**
 * Bundle-time entry for `sharp`: the real native module, with the
 * header-parsing stub as fallback (sharp warns Electron-on-Linux library
 * conflicts are possible; a disabled converter beats an app that won't
 * boot). The shadowed `require` keeps esbuild from resolving 'sharp' at
 * bundle time — the alias would loop back here.
 */
const require = createRequire(import.meta.url)

let sharp
try {
	sharp = require('sharp')
} catch (error) {
	console.warn(
		`[echo-desktop] native sharp failed to load (${error.message}); image conversion is disabled, uploads still work`,
	)
	sharp = stub
}

export default sharp
