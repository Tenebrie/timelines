import { EventEmitter } from 'node:events'

import fengari from 'fengari'

const { lua, lauxlib, lualib, to_luastring } = fengari

/**
 * In-memory drop-in replacement for the `redis` package. Rhea and Calliope
 * share one process in desktop mode, so a process-wide store (on globalThis,
 * shared across module instances) stands in for the Redis server.
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

/** Synchronous command dispatcher shared by the client API and the Lua bridge. */
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
 * EVAL runs on fengari, a pure-JS Lua VM. Pure JS is a hard requirement:
 * EVAL sits on the per-keystroke Yjs path, and sustained WASM-Lua
 * invocation (wasmoon) segfaulted Electron's V8.
 */
function evalLua(store, script, options = {}) {
	const keys = options.keys ?? []
	const argv = (options.arguments ?? []).map(String)

	const L = lauxlib.luaL_newstate()
	try {
		lualib.luaL_openlibs(L)
		pushStringArray(L, keys)
		lua.lua_setglobal(L, to_luastring('KEYS'))
		pushStringArray(L, argv)
		lua.lua_setglobal(L, to_luastring('ARGV'))

		lua.lua_createtable(L, 0, 1)
		lua.lua_pushcfunction(L, (state) => {
			const args = []
			for (let i = 1; i <= lua.lua_gettop(state); i++) {
				args.push(
					lua.lua_type(state, i) === lua.LUA_TNUMBER
						? lua.lua_tonumber(state, i)
						: lua.lua_tojsstring(state, i),
				)
			}
			let reply
			try {
				reply = dispatch(store, args[0], args.slice(1))
			} catch (error) {
				return lauxlib.luaL_error(state, to_luastring(String(error?.message ?? error)))
			}
			pushReply(state, reply)
			return 1
		})
		lua.lua_setfield(L, -2, to_luastring('call'))
		lua.lua_setglobal(L, to_luastring('redis'))

		if (lauxlib.luaL_dostring(L, to_luastring(script)) !== lua.LUA_OK) {
			throw new Error(`echo-desktop redis shim: EVAL failed: ${lua.lua_tojsstring(L, -1)}`)
		}
		return lua.lua_gettop(L) > 0 ? toRedisReply(L, lua.lua_gettop(L)) : null
	} finally {
		lua.lua_close(L)
	}
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

	// Unimplemented methods reject with an actionable message. Promise
	// introspection props must stay undefined.
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

function pushStringArray(L, values) {
	lua.lua_createtable(L, values.length, 0)
	values.forEach((value, index) => {
		lua.lua_pushliteral(L, value)
		lua.lua_rawseti(L, -2, index + 1)
	})
}

function pushReply(L, reply) {
	if (reply === null) {
		lua.lua_pushboolean(L, false)
	} else if (typeof reply === 'number') {
		lua.lua_pushinteger(L, Math.trunc(reply))
	} else if (Array.isArray(reply)) {
		lua.lua_createtable(L, reply.length, 0)
		reply.forEach((item, index) => {
			pushReply(L, item)
			lua.lua_rawseti(L, -2, index + 1)
		})
	} else {
		lua.lua_pushliteral(L, String(reply))
	}
}

// Mirrors Redis's Lua conversions: false -> nil, true -> 1, numbers truncate
function toRedisReply(L, index) {
	switch (lua.lua_type(L, index)) {
		case lua.LUA_TBOOLEAN:
			return lua.lua_toboolean(L, index) ? 1 : null
		case lua.LUA_TNUMBER:
			return Math.trunc(lua.lua_tonumber(L, index))
		case lua.LUA_TSTRING:
			return lua.lua_tojsstring(L, index)
		case lua.LUA_TTABLE: {
			const items = []
			for (let n = 1; ; n++) {
				lua.lua_rawgeti(L, index, n)
				if (lua.lua_type(L, -1) === lua.LUA_TNIL) {
					lua.lua_pop(L, 1)
					return items
				}
				items.push(toRedisReply(L, lua.lua_gettop(L)))
				lua.lua_pop(L, 1)
			}
		}
		default:
			return null
	}
}
