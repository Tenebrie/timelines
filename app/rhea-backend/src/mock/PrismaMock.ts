import { PrismaClient } from '@prisma/client'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { app } from '..'

jest.mock('@src/services/dbClients/DatabaseClient', () => {
	const mock = mockDeep<PrismaClient>()
	return {
		__esModule: true,
		DatabaseClient: mock,
		dbClient: mock,
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

beforeEach(() => {
	mockReset(prismaMock)
})

import { DatabaseClient } from '@src/services/dbClients/DatabaseClient'
import { RedisClientType } from 'redis'

export const prismaMock = DatabaseClient as unknown as DeepMockProxy<PrismaClient>

export const makeRequest = () => request(app.callback())
export const sendGet = (...args: Parameters<ReturnType<typeof request>['get']>) => makeRequest().get(...args)

export const withAuth = <UserObject>(auth: (ctx: any) => UserObject | Promise<UserObject>) => {
	jest.spyOn(auth, '')

	return {
		get: sendGet,
	}
}
