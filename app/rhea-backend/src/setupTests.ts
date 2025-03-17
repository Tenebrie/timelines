import { PrismaClient } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

process.env['jwt-secret'] = 'secretkey'

jest.mock('moonflower', () => {
	return {
		__esModule: true, //    <----- this __esModule: true is important
		...jest.requireActual('moonflower'),
	}
})

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
