import net from 'node:net'

import { LOOPBACK_HOSTS } from './dns-remap.mjs'

/**
 * In docker every service binds a fixed port inside its own network
 * namespace (Rhea :3000, Calliope :3001) and peers reach it by docker DNS
 * name. In desktop mode all services share the host, so those fixed ports
 * collide with anything else on the machine — including the docker dev
 * stack itself. This patch virtualizes them at the net layer:
 *
 *   - a listen() on a virtual port binds a random free port on 127.0.0.1
 *     instead (which also undoes the all-interfaces exposure of the docker
 *     builds), and
 *   - outgoing connections to a docker hostname on a virtual port are
 *     rewritten to the port that service actually bound.
 *
 * Upstream keeps its hardcoded ports; only the returned map knows the real
 * ones. If a service ever hardcodes a NEW port, add it to the list the
 * launcher passes in — an unmapped port simply binds as-is.
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

	// Callers reach services by docker hostname, but some clients (undici's
	// fetch) resolve DNS themselves and connect by IP — inside this process a
	// loopback connection to a virtual port can only mean that service, so
	// loopback addresses remap too.
	const isServiceHost = (host) =>
		LOOPBACK_HOSTS.has(host) || host === '127.0.0.1' || host === 'localhost' || host === '::1' || host === undefined

	const originalConnect = net.Socket.prototype.connect
	net.Socket.prototype.connect = function (...args) {
		// net.connect() pre-normalizes its arguments and calls this with a
		// marked [options, callback] array; direct callers pass (options, cb)
		// or (port, host, cb).
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
