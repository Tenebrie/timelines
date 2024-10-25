import { PrismaClient } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

process.env.JWT_SECRET = 'secretkey'

jest.mock('@src/services/dbClients/DatabaseClient', () => {
	const mock = mockDeep<PrismaClient>()
	return {
		__esModule: true,
		DatabaseClient: mock,
		getPrismaClient: () => mock,
	}
})

jest.mock('@src/services/dbClients/RedisClient', () => {
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
