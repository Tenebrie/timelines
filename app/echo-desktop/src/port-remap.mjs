import net from 'node:net'

import { LOOPBACK_HOSTS } from './dns-remap.mjs'

/**
 * Virtualizes the services' hardcoded ports at the net layer: a listen() on
 * a virtual port binds a random free loopback port instead, and outgoing
 * connections to it are rewritten to the port actually bound. A service
 * hardcoding a NEW port needs an entry in the launcher's list.
 */
export function installPortRemap(virtualPorts) {
	const actualPorts = new Map()
	const bindings = new Map(
		virtualPorts.map((virtualPort) => {
			let resolve
			const promise = new Promise((r) => {
				resolve = r
			})
			return [virtualPort, { promise, resolve }]
		}),
	)

	const originalListen = net.Server.prototype.listen
	net.Server.prototype.listen = function (...args) {
		const requested = typeof args[0] === 'number' ? args[0] : args[0]?.port
		const binding = bindings.get(requested)
		if (!binding) return originalListen.apply(this, args)
		this.once('listening', () => {
			actualPorts.set(requested, this.address().port)
			binding.resolve(this.address().port)
		})
		const callback = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : undefined
		return originalListen.call(this, { port: 0, host: '127.0.0.1' }, callback)
	}

	// undici's fetch resolves DNS itself and connects by IP, so loopback
	// addresses on a virtual port count as service traffic too
	const isServiceHost = (host) =>
		LOOPBACK_HOSTS.has(host) || host === '127.0.0.1' || host === 'localhost' || host === '::1' || host === undefined

	const originalConnect = net.Socket.prototype.connect
	net.Socket.prototype.connect = function (...args) {
		// net.connect() pre-normalizes its arguments into an [options, callback] array
		const normalized = Array.isArray(args[0]) ? args[0] : undefined
		const options = normalized
			? normalized[0]
			: typeof args[0] === 'object' && args[0] !== null
				? args[0]
				: undefined
		const host = options ? (options.host ?? options.hostname) : args[1]
		const port = Number(options ? options.port : args[0])
		const actual = isServiceHost(host) ? actualPorts.get(port) : undefined
		if (actual === undefined) return originalConnect.apply(this, args)
		if (normalized) {
			return originalConnect.call(this, { ...options, port: actual }, ...(normalized[1] ? [normalized[1]] : []))
		}
		if (options) return originalConnect.call(this, { ...options, port: actual }, ...args.slice(1))
		return originalConnect.call(this, actual, ...args.slice(1))
	}

	return { whenBound: (virtualPort) => bindings.get(virtualPort).promise }
}
