import { getRedisClient } from './dbClients/RedisClient.js'

type RedisCache = {
	assetPresignedUrl: {
		url: string
	}
}

export const RedisCacheService = {
	upsertCacheEntry: async <T extends keyof RedisCache>({
		type,
		key,
		value,
		expiresInSeconds,
	}: {
		type: T
		key: string
		value: RedisCache[T]
		expiresInSeconds?: number
	}) => {
		await getRedisClient().set(`${type}:${key}`, JSON.stringify(value), {
			expiration: expiresInSeconds
				? {
						type: 'EX',
						value: expiresInSeconds,
					}
				: undefined,
		})
	},

	getCacheEntry: async <T extends keyof RedisCache>(type: T, key: string): Promise<RedisCache[T] | null> => {
		const value = await getRedisClient().get(`${type}:${key}`)
		return value ? JSON.parse(value) : null
	},
}
