import chalk from 'chalk'
import { createClient } from 'redis'

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST ?? 'redis',
	},
})

client.on('error', (err) => {
	if (client.isReady) {
		console.error('[Redis] Client error:', err)
	}
})

const fallback = new Map<string, string>()

let connectPromise: Promise<void> | null = null

export const RedisService = {
	connect: async (): Promise<void> => {
		if (client.isReady) {
			return
		}
		if (!connectPromise) {
			connectPromise = client
				.connect()
				.then(() => console.info(`${chalk.greenBright('[Orpheus]')} Connection to Redis established!`))
				.catch((err) => console.error(`Redis connection failed:`, err))
		}
		await connectPromise
	},

	isReady: (): boolean => client.isReady,

	get: async (key: string): Promise<string | null> => {
		if (!client.isReady) {
			return fallback.get(key) ?? null
		}
		try {
			return await client.get(key)
		} catch (err) {
			console.error(`[Redis] Failed to read "${key}":`, err)
			return null
		}
	},

	set: async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
		if (!client.isReady) {
			fallback.set(key, value)
			return
		}
		try {
			await client.set(key, value, ttlSeconds ? { EX: ttlSeconds } : undefined)
		} catch (err) {
			console.error(`[Redis] Failed to write "${key}":`, err)
		}
	},

	del: async (key: string): Promise<void> => {
		if (!client.isReady) {
			fallback.delete(key)
			return
		}
		try {
			await client.del(key)
		} catch (err) {
			console.error(`[Redis] Failed to delete "${key}":`, err)
		}
	},
}
