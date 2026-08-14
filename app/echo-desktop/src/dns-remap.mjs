import dns from 'node:dns'

/**
 * The services reference each other by their docker-compose hostnames
 * (Calliope calls `http://rhea:3000`, Rhea's storage service rewrites
 * `http://s3-minio:9000` URLs). In desktop mode everything listens on
 * loopback, so resolve those hostnames to 127.0.0.1 at the DNS layer —
 * no upstream code needs to change and the docker deployment is untouched.
 */
const LOOPBACK_HOSTS = new Set(['rhea', 'calliope', 'redis', 's3-minio', 'gatekeeper'])

export function installDnsRemap() {
	const originalLookup = dns.lookup

	function patchedLookup(hostname, options, callback) {
		if (typeof options === 'function') {
			callback = options
			options = {}
		}
		if (LOOPBACK_HOSTS.has(hostname)) {
			const family = options?.family === 6 ? 6 : 4
			const address = family === 6 ? '::1' : '127.0.0.1'
			process.nextTick(() => {
				if (options?.all) {
					callback(null, [{ address, family }])
				} else {
					callback(null, address, family)
				}
			})
			return
		}
		return originalLookup(hostname, options, callback)
	}
	// net.connect type-checks dns.lookup custom implementations loosely, but
	// undici verifies the __promisify__ marker exists when promisifying.
	patchedLookup.__promisify__ = originalLookup.__promisify__
	dns.lookup = patchedLookup

	const originalPromisesLookup = dns.promises.lookup
	dns.promises.lookup = async (hostname, options) => {
		if (LOOPBACK_HOSTS.has(hostname)) {
			const family = options?.family === 6 ? 6 : 4
			const address = family === 6 ? '::1' : '127.0.0.1'
			if (options?.all) return [{ address, family }]
			return { address, family }
		}
		return originalPromisesLookup(hostname, options)
	}
}
