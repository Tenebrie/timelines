import dns from 'node:dns'

/**
 * Resolves the docker-compose hostnames the services use to reach each other
 * (`rhea`, `s3-minio`, …) to 127.0.0.1 at the DNS layer.
 */
export const LOOPBACK_HOSTS = new Set(['rhea', 'calliope', 'redis', 's3-minio', 'gatekeeper'])

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
