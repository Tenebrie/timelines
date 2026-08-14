/**
 * The single source of truth for module substitutions, consumed by both the
 * dev-mode ESM loader hook (loader-hooks.mjs) and the packaged-mode esbuild
 * aliases (scripts/bundle-backends.mjs) so the two lists cannot drift.
 *
 * RUNTIME_SHIMS swap infrastructure clients in both modes. BUNDLE_STUBS only
 * apply at bundle time — they cut native dependency chains out of the package
 * for features that are disabled in desktop mode; dev mode keeps the real
 * packages.
 */
export const RUNTIME_SHIMS = {
	redis: './redis-shim.mjs',
	'@prisma/adapter-pg': './adapter-pg-shim.mjs',
}

export const BUNDLE_STUBS = {
	sharp: './sharp-loader.mjs',
	'y-leveldb': './y-leveldb-stub.mjs',
}
