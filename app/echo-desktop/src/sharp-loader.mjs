import { createRequire } from 'node:module'

import stub from './sharp-stub.mjs'

/**
 * Bundle-time entry for `sharp`: prefer the real native module (full
 * conversion pipeline, ~18 MB of platform prebuilds shipped in the package),
 * fall back to the header-parsing stub if it fails to load — sharp warns
 * that Electron-on-Linux library conflicts are possible on some setups, and
 * a desktop app with image conversion disabled beats one that won't boot.
 *
 * The shadowed `require` keeps esbuild from resolving 'sharp' at bundle time
 * (the alias would loop back here); it resolves at runtime from the packaged
 * node_modules instead.
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
