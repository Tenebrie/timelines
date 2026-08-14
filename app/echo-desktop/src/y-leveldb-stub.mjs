/**
 * Bundle-time stand-in for y-leveldb. @y/websocket-server imports it
 * statically but only constructs it when a YPERSISTENCE directory is
 * configured — which desktop mode never does (Calliope persists Yjs state
 * through Redis + Rhea instead). Stubbing it keeps the native LevelDB
 * dependency chain (leveldown) out of the bundle entirely.
 */
export class LeveldbPersistence {
	constructor() {
		throw new Error(
			'[echo-desktop] y-leveldb is stubbed out in the desktop bundle. If YPERSISTENCE support is now required, remove the y-leveldb alias in scripts/bundle-backends.mjs.',
		)
	}
}
