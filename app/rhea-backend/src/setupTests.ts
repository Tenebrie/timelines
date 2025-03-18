import { vi } from 'vitest'

import { prismaMockRef } from './mock/utils/prismaMock'

vi.mock('moonflower', async () => {
	return {
		__esModule: true, //    <----- this __esModule: true is important
		...(await vi.importActual('moonflower')),
	}
})

vi.mock('@src/services/dbClients/DatabaseClient', () => {
	return {
		__esModule: true,
		DatabaseClient: prismaMockRef.current,
		getPrismaClient: () => prismaMockRef.current,
	}
})

vi.mock('@src/services/dbClients/RedisClient', () => {
	return {
		__esModule: true,
		getRedisClient: () => ({
			connect: async () => {
				/* Empty */
			},
		}),
		openRedisChannel: () => ({
			sendMessage: () => {
				/* Empty */
			},
		}),
	}
})
