import { EventEmitter } from 'node:events'

/**
 * In-memory drop-in replacement for the `redis` package, injected via the ESM
 * loader hook (see loader-hooks.mjs). Rhea and Calliope run in the same process
 * in desktop mode, so a process-wide store stands in for the Redis server:
 * pub/sub between the two apps, the presigned-URL cache, and the Yjs hot store
 * all keep their existing semantics.
 *
 * The store lives on globalThis so every importer shares one instance even if
 * this module is ever evaluated under two different URLs.
 */
function getStore() {
	if (!globalThis.__NEVERKIN_DESKTOP_REDIS__) {
		const data = new Map()
		const sweeper = setInterval(() => {
			const now = Date.now()
			for (const [key, entry] of data) {
				if (entry.expiresAt !== null && entry.expiresAt <= now) data.delete(key)
			}
		}, 10_000)
		sweeper.unref()
		globalThis.__NEVERKIN_DESKTOP_REDIS__ = { data, pubsub: new EventEmitter().setMaxListeners(0) }
	}
	return globalThis.__NEVERKIN_DESKTOP_REDIS__
}

function liveEntry(store, key) {
	const entry = store.data.get(key)
	if (!entry) return null
	if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
		store.data.delete(key)
		return null
	}
	return entry
}

/**
 * Synchronous command dispatcher shared by the client API and the Lua bridge.
 * Mirrors real Redis return values so `redis.call(...)` comparisons in the
 * upstream Lua scripts keep working (missing GET -> null, mapped to Lua false).
 */
function dispatch(store, command, args) {
	const cmd = String(command).toUpperCase()
	switch (cmd) {
		case 'GET': {
			const entry = liveEntry(store, args[0])
			return entry ? entry.value : null
		}
		case 'SET': {
			const [key, value, ...rest] = args
			let expiresAt = null
			let nx = false
			let xx = false
			for (let i = 0; i < rest.length; i++) {
				const opt = String(rest[i]).toUpperCase()
				if (opt === 'EX') expiresAt = Date.now() + Number(rest[++i]) * 1000
				else if (opt === 'PX') expiresAt = Date.now() + Number(rest[++i])
				else if (opt === 'NX') nx = true
				else if (opt === 'XX') xx = true
				else if (opt === 'KEEPTTL') expiresAt = liveEntry(store, key)?.expiresAt ?? null
			}
			const exists = liveEntry(store, key) !== null
			if ((nx && exists) || (xx && !exists)) return null
			store.data.set(key, { type: 'string', value: String(value), expiresAt })
			return 'OK'
		}
		case 'DEL': {
			let count = 0
			for (const key of args) if (liveEntry(store, key)) count += store.data.delete(key) ? 1 : 0
			return count
		}
		case 'EXISTS': {
			let count = 0
			for (const key of args) if (liveEntry(store, key)) count++
			return count
		}
		case 'EXPIRE': {
			const entry = liveEntry(store, args[0])
			if (!entry) return 0
			entry.expiresAt = Date.now() + Number(args[1]) * 1000
			return 1
		}
		case 'PEXPIRE': {
			const entry = liveEntry(store, args[0])
			if (!entry) return 0
			entry.expiresAt = Date.now() + Number(args[1])
			return 1
		}
		case 'PERSIST': {
			const entry = liveEntry(store, args[0])
			if (!entry || entry.expiresAt === null) return 0
			entry.expiresAt = null
			return 1
		}
		case 'TTL': {
			const entry = liveEntry(store, args[0])
			if (!entry) return -2
			if (entry.expiresAt === null) return -1
			return Math.ceil((entry.expiresAt - Date.now()) / 1000)
		}
		case 'RPUSH':
		case 'LPUSH': {
			const [key, ...values] = args
			let entry = liveEntry(store, key)
			if (!entry) {
				entry = { type: 'list', value: [], expiresAt: null }
				store.data.set(key, entry)
			}
			for (const value of values) {
				if (cmd === 'RPUSH') entry.value.push(String(value))
				else entry.value.unshift(String(value))
			}
			return entry.value.length
		}
		case 'LRANGE': {
			const entry = liveEntry(store, args[0])
			if (!entry) return []
			const list = entry.value
			let start = Number(args[1])
			let stop = Number(args[2])
			if (start < 0) start = Math.max(list.length + start, 0)
			if (stop < 0) stop = list.length + stop
			return list.slice(start, stop + 1)
		}
		case 'LLEN': {
			const entry = liveEntry(store, args[0])
			return entry ? entry.value.length : 0
		}
		case 'LPOP': {
			const entry = liveEntry(store, args[0])
			return entry && entry.value.length > 0 ? entry.value.shift() : null
		}
		case 'RPOP': {
			const entry = liveEntry(store, args[0])
			return entry && entry.value.length > 0 ? entry.value.pop() : null
		}
		case 'INCR':
		case 'INCRBY': {
			const [key, by] = args
			const entry = liveEntry(store, key)
			const next = (entry ? Number(entry.value) : 0) + (cmd === 'INCR' ? 1 : Number(by))
			store.data.set(key, { type: 'string', value: String(next), expiresAt: entry?.expiresAt ?? null })
			return next
		}
		case 'MGET':
			return args.map((key) => {
				const entry = liveEntry(store, key)
				return entry ? entry.value : null
			})
		case 'KEYS': {
			const pattern = new RegExp(
				'^' +
					String(args[0])
						.replace(/[.+^${}()|[\]\\]/g, '\\$&')
						.replace(/\*/g, '.*')
						.replace(/\?/g, '.') +
					'$',
			)
			const result = []
			for (const key of store.data.keys()) if (liveEntry(store, key) && pattern.test(key)) result.push(key)
			return result
		}
		case 'PUBLISH': {
			const [channel, message] = args
			queueMicrotask(() => store.pubsub.emit(`message:${channel}`, String(message), String(channel)))
			return store.pubsub.listenerCount(`message:${channel}`)
		}
		default:
			throw new Error(`echo-desktop redis shim: unsupported command ${cmd}`)
	}
}

/**
 * EVAL support. Primary path: a pure-JS interpreter for the Lua subset the
 * upstream scripts use (redis.call statements, local assignments, if/then
 * blocks, == comparisons, tonumber, return). WASM Lua (wasmoon) is only a
 * lazy fallback for scripts outside that subset — sustained wasmoon
 * invocation segfaults Electron's V8, so it must stay off the hot path.
 */
const UNSUPPORTED = Symbol('unsupported-lua')
const RETURN = Symbol('lua-return')

function evalLuaSubset(store, script, keys, argv) {
	const lines = script
		.split('\n')
		.map((line) => line.replace(/--.*$/, '').trim())
		.filter((line) => line.length > 0)

	const call = (command, args) => {
		const result = dispatch(store, command, args)
		// Redis maps nil replies to Lua false
		return result === null ? false : result
	}

	const vars = new Map()

	function splitTopLevel(text, separator) {
		const parts = []
		let depth = 0
		let inString = false
		let current = ''
		for (let i = 0; i < text.length; i++) {
			const ch = text[i]
			if (inString) {
				current += ch
				if (ch === "'") inString = false
				continue
			}
			if (ch === "'") inString = true
			else if (ch === '(' || ch === '[') depth++
			else if (ch === ')' || ch === ']') depth--
			if (depth === 0 && text.startsWith(separator, i)) {
				parts.push(current)
				current = ''
				i += separator.length - 1
				continue
			}
			current += ch
		}
		parts.push(current)
		return parts
	}

	function evalExpr(raw) {
		const text = raw.trim()
		const equality = splitTopLevel(text, '==')
		if (equality.length === 2) {
			const left = evalExpr(equality[0])
			const right = evalExpr(equality[1])
			if (left === UNSUPPORTED || right === UNSUPPORTED) return UNSUPPORTED
			return left === right
		}
		if (equality.length > 2) return UNSUPPORTED
		if (text === 'false') return false
		if (text === 'true') return true
		if (text === 'nil') return false
		if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text)
		const stringMatch = text.match(/^'([^']*)'$/)
		if (stringMatch) return stringMatch[1]
		const indexMatch = text.match(/^(KEYS|ARGV)\[(\d+)\]$/)
		if (indexMatch) {
			const source = indexMatch[1] === 'KEYS' ? keys : argv
			return source[Number(indexMatch[2]) - 1]
		}
		const tonumberMatch = text.match(/^tonumber\((.+)\)$/)
		if (tonumberMatch) {
			const inner = evalExpr(tonumberMatch[1])
			return inner === UNSUPPORTED ? UNSUPPORTED : Number(inner)
		}
		const callMatch = text.match(/^redis\.call\((.+)\)$/)
		if (callMatch) {
			const args = splitTopLevel(callMatch[1], ',').map((arg) => evalExpr(arg))
			if (args.some((arg) => arg === UNSUPPORTED)) return UNSUPPORTED
			return call(args[0], args.slice(1))
		}
		if (/^[a-zA-Z_]\w*$/.test(text) && vars.has(text)) return vars.get(text)
		return UNSUPPORTED
	}

	// Executes statements from `index` until an `end`/EOF; returns
	// { next } or { next, result: [value] } on return, or UNSUPPORTED.
	function execBlock(index, stopAtEnd) {
		let i = index
		while (i < lines.length) {
			const line = lines[i]
			if (stopAtEnd && line === 'end') return { next: i + 1 }

			const localMatch = line.match(/^local ([a-zA-Z_]\w*) = (.+)$/)
			if (localMatch) {
				const value = evalExpr(localMatch[2])
				if (value === UNSUPPORTED) return UNSUPPORTED
				vars.set(localMatch[1], value)
				i++
				continue
			}
			const ifMatch = line.match(/^if (.+) then$/)
			if (ifMatch) {
				const condition = evalExpr(ifMatch[1])
				if (condition === UNSUPPORTED) return UNSUPPORTED
				if (condition !== false && condition !== undefined) {
					const body = execBlock(i + 1, true)
					if (body === UNSUPPORTED) return UNSUPPORTED
					if (body.result) return body
					i = body.next
				} else {
					// skip to the matching end
					let depth = 1
					let j = i + 1
					while (j < lines.length && depth > 0) {
						if (/^if .+ then$/.test(lines[j])) depth++
						if (lines[j] === 'end') depth--
						j++
					}
					if (depth !== 0) return UNSUPPORTED
					i = j
				}
				continue
			}
			const returnMatch = line.match(/^return(?: (.+))?$/)
			if (returnMatch) {
				if (returnMatch[1] === undefined) return { next: i + 1, result: [null], [RETURN]: true }
				const value = evalExpr(returnMatch[1])
				if (value === UNSUPPORTED) return UNSUPPORTED
				return { next: i + 1, result: [value === false ? null : value] }
			}
			if (/^redis\.call\(/.test(line)) {
				const value = evalExpr(line)
				if (value === UNSUPPORTED) return UNSUPPORTED
				i++
				continue
			}
			return UNSUPPORTED
		}
		return { next: i }
	}

	const outcome = execBlock(0, false)
	if (outcome === UNSUPPORTED) return UNSUPPORTED
	return outcome.result ? outcome.result[0] : null
}

/** wasmoon fallback for scripts outside the JS-interpreted subset. */
let luaEnginePromise = null
let luaQueue = Promise.resolve()
let warnedWasmFallback = false

async function getLuaEngine() {
	if (!luaEnginePromise) {
		luaEnginePromise = import('wasmoon').then(({ LuaFactory }) => new LuaFactory().createEngine())
	}
	return luaEnginePromise
}

function evalLua(store, script, options = {}) {
	const keys = options.keys ?? []
	const argv = (options.arguments ?? []).map(String)

	const subsetResult = evalLuaSubset(store, script, keys, argv)
	if (subsetResult !== UNSUPPORTED) return Promise.resolve(subsetResult)

	if (!warnedWasmFallback) {
		warnedWasmFallback = true
		console.warn(
			'[echo-desktop] redis shim: EVAL script outside the JS-interpreted Lua subset, falling back to wasmoon. ' +
				'Extend evalLuaSubset in redis-shim.mjs — sustained wasmoon use is unstable under Electron.',
		)
	}
	const run = async () => {
		const lua = await getLuaEngine()
		lua.global.set('KEYS', keys)
		lua.global.set('ARGV', argv)
		lua.global.set('redis', {
			call: (command, ...args) => {
				const result = dispatch(store, command, args)
				return result === null ? false : result
			},
		})
		return await lua.doString(script)
	}
	const chained = luaQueue.then(run, run)
	luaQueue = chained.then(
		() => undefined,
		() => undefined,
	)
	return chained
}

function createClientInstance() {
	const store = getStore()
	const emitter = new EventEmitter()
	const subscriptions = new Map()
	let open = false

	const client = {
		on: (event, listener) => {
			emitter.on(event, listener)
			return client
		},
		once: (event, listener) => {
			emitter.once(event, listener)
			return client
		},
		off: (event, listener) => {
			emitter.off(event, listener)
			return client
		},
		removeListener: (event, listener) => {
			emitter.removeListener(event, listener)
			return client
		},
		get isReady() {
			return open
		},
		get isOpen() {
			return open
		},
		connect: async () => {
			open = true
			emitter.emit('connect')
			emitter.emit('ready')
			return client
		},
		disconnect: async () => {
			open = false
			emitter.emit('end')
		},
		quit: async () => {
			open = false
			emitter.emit('end')
			return 'OK'
		},
		duplicate: () => createClientInstance(),

		publish: async (channel, message) => dispatch(store, 'PUBLISH', [channel, message]),
		subscribe: async (channels, listener) => {
			for (const channel of Array.isArray(channels) ? channels : [channels]) {
				const previous = subscriptions.get(channel)
				if (previous) store.pubsub.off(`message:${channel}`, previous)
				const handler = (message, channelName) => listener(message, channelName)
				subscriptions.set(channel, handler)
				store.pubsub.on(`message:${channel}`, handler)
			}
		},
		unsubscribe: async (channels) => {
			const list = channels ? (Array.isArray(channels) ? channels : [channels]) : [...subscriptions.keys()]
			for (const channel of list) {
				const handler = subscriptions.get(channel)
				if (handler) store.pubsub.off(`message:${channel}`, handler)
				subscriptions.delete(channel)
			}
		},

		get: async (key) => dispatch(store, 'GET', [key]),
		set: async (key, value, options) => {
			const args = [key, value]
			if (options) {
				// node-redis supports both the flat option object ({ NX, EX, PX })
				// and the nested form ({ expiration: { type: 'EX', value: n } })
				if (options.expiration && options.expiration.type) {
					args.push(options.expiration.type, options.expiration.value)
				}
				if (options.EX !== undefined) args.push('EX', options.EX)
				if (options.PX !== undefined) args.push('PX', options.PX)
				if (options.NX) args.push('NX')
				if (options.XX) args.push('XX')
				if (options.KEEPTTL) args.push('KEEPTTL')
			}
			return dispatch(store, 'SET', args)
		},
		setEx: async (key, seconds, value) => dispatch(store, 'SET', [key, value, 'EX', seconds]),
		del: async (...keys) => dispatch(store, 'DEL', keys.flat()),
		exists: async (...keys) => dispatch(store, 'EXISTS', keys.flat()),
		expire: async (key, seconds) => dispatch(store, 'EXPIRE', [key, seconds]) === 1,
		pExpire: async (key, ms) => dispatch(store, 'PEXPIRE', [key, ms]) === 1,
		persist: async (key) => dispatch(store, 'PERSIST', [key]) === 1,
		ttl: async (key) => dispatch(store, 'TTL', [key]),
		incr: async (key) => dispatch(store, 'INCR', [key]),
		incrBy: async (key, by) => dispatch(store, 'INCRBY', [key, by]),
		mGet: async (keys) => dispatch(store, 'MGET', keys),
		keys: async (pattern) => dispatch(store, 'KEYS', [pattern]),
		rPush: async (key, values) =>
			dispatch(store, 'RPUSH', [key, ...(Array.isArray(values) ? values : [values])]),
		lPush: async (key, values) =>
			dispatch(store, 'LPUSH', [key, ...(Array.isArray(values) ? values : [values])]),
		lRange: async (key, start, stop) => dispatch(store, 'LRANGE', [key, start, stop]),
		lLen: async (key) => dispatch(store, 'LLEN', [key]),
		lPop: async (key) => dispatch(store, 'LPOP', [key]),
		rPop: async (key) => dispatch(store, 'RPOP', [key]),
		ping: async () => 'PONG',
		eval: async (script, options) => evalLua(store, script, options),
		evalSha: async (_sha, _options) => {
			throw new Error('echo-desktop redis shim: EVALSHA is not supported, use EVAL')
		},
		sendCommand: async (args) => dispatch(store, args[0], args.slice(1)),
	}

	// Unknown-method fallback: future upstream code that calls a command this
	// shim does not implement gets a rejection with an actionable message —
	// beta policy is to fail loudly rather than degrade silently. Promise-
	// introspection props must stay undefined. Caveat: unknown *data
	// properties* (e.g. client.options) also come back as a function — add
	// them to the client object above if upstream reads one.
	return new Proxy(client, {
		get(target, prop, receiver) {
			if (prop in target || typeof prop === 'symbol') return Reflect.get(target, prop, receiver)
			if (prop === 'then' || prop === 'catch' || prop === 'finally' || prop === 'constructor')
				return undefined
			return async (...args) => {
				throw new Error(
					`[echo-desktop] redis shim: unimplemented client method "${String(prop)}" called (args: ${JSON.stringify(args).slice(0, 200)}). Extend redis-shim.mjs.`,
				)
			}
		},
	})
}

export function createClient() {
	return createClientInstance()
}

export function createCluster() {
	return createClientInstance()
}

export default { createClient, createCluster }
