import { getRedisClient } from './dbClients/RedisClient.js'

type IconifyCollection = {
	name: string
	total: number
	author: {
		name: string
		url?: string
	}
	license: {
		title: string
		spdx?: string
		url?: string
	}
	samples: string[]
	height?: number | number[]
	category?: string
	palette?: boolean
}

type IconifyCollectionsResponse = Record<string, IconifyCollection>

const CACHE_KEY = 'iconify:collections'
const CACHE_TTL = 24 * 60 * 60 // 24 hours in seconds

export const IconifyService = {
	getCollections: async () => {
		const redis = getRedisClient()

		try {
			// Try to get from Redis cache
			const cached = await redis.get(CACHE_KEY)
			if (cached) {
				return JSON.parse(cached) as IconifyCollectionsResponse
			}
		} catch (error) {
			console.error('Failed to read from Redis cache:', error)
		}

		// Fetch fresh data from Iconify API
		try {
			console.info('Fetching Iconify collections')
			const response = await fetch('https://api.iconify.design/collections')
			if (response.ok) {
				const data: IconifyCollectionsResponse = await response.json()

				// Store in Redis cache with TTL
				try {
					await redis.set(CACHE_KEY, JSON.stringify(data), {
						EX: CACHE_TTL,
					})
				} catch (error) {
					console.error('Failed to write to Redis cache:', error)
				}

				return data
			}
		} catch (error) {
			console.error('Failed to fetch Iconify collections:', error)
		}

		return {}
	},
}
