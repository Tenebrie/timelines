/**
 * Module substitutions, shared by the dev-mode loader hook and the
 * packaged-mode esbuild aliases so the two cannot drift. RUNTIME_SHIMS apply
 * in both modes; BUNDLE_STUBS only at bundle time.
 */
export const RUNTIME_SHIMS = {
	redis: './redis-shim.mjs',
	'@prisma/adapter-pg': './adapter-pg-shim.mjs',
}

export const BUNDLE_STUBS = {
	sharp: './sharp-loader.mjs',
	'y-leveldb': './y-leveldb-stub.mjs',
}
