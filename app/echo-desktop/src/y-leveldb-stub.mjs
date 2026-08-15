/**
 * Bundle-time stand-in for y-leveldb: imported statically by
 * @y/websocket-server but only constructed when YPERSISTENCE is configured,
 * which desktop mode never does.
 */
export class LeveldbPersistence {
	constructor() {
		throw new Error(
			'[echo-desktop] y-leveldb is stubbed out in the desktop bundle. If YPERSISTENCE support is now required, remove the y-leveldb alias in scripts/bundle-backends.mjs.',
		)
	}
}
