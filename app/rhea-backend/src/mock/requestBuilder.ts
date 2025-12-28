import { CollaboratingUser, User, World } from '@prisma/client'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import request from 'supertest'
import { beforeEach, vi } from 'vitest'

import { app } from '../index.js'
import { withUserAuth } from './auth.js'
import { mockCollaboratingUser, mockUser, mockWorld } from './mock.js'
import { mockPrismaClient } from './utils/prismaMock.js'

export const makeRequest = () => request(app.callback())
export const sendGet = (...args: Parameters<ReturnType<typeof request>['get']>) => makeRequest().get(...args)
export const sendPost = (...args: Parameters<ReturnType<typeof request>['post']>) =>
	makeRequest().post(...args)
export const sendPatch = (...args: Parameters<ReturnType<typeof request>['patch']>) =>
	makeRequest().patch(...args)
export const sendDelete = (...args: Parameters<ReturnType<typeof request>['delete']>) =>
	makeRequest().delete(...args)

export const withWorld = (world?: Partial<World>) => {
	mockPrismaClient({ world: mockWorld(world) })

	return requestBuilder
}

export const withCollaboratingUser = (data?: Partial<CollaboratingUser>) => {
	mockPrismaClient({ collaboratingUser: mockCollaboratingUser(data) })

	return requestBuilder
}

export const withWorldReadAccess = (mockedUser?: Partial<User>, mockedWorld?: Partial<World>) => {
	vi.spyOn(AuthorizationService, 'checkUserReadAccessById').mockImplementation(async (user, worldId) => {
		if (user?.id === mockUser(mockedUser).id && worldId === mockWorld(mockedWorld).id) {
			return
		}
		throw new Error('Unauthorized')
	})

	return requestBuilder
}

export const withWorldWriteAccess = (mockedUser?: Partial<User>, mockedWorld?: Partial<World>) => {
	vi.spyOn(AuthorizationService, 'checkUserReadAccessById').mockImplementation(async (user, worldId) => {
		if (user?.id === mockUser(mockedUser).id && worldId === mockWorld(mockedWorld).id) {
			return
		}
		throw new Error('Unauthorized')
	})
	vi.spyOn(AuthorizationService, 'checkUserWriteAccessById').mockImplementation(async (user, worldId) => {
		if (user?.id === mockUser(mockedUser).id && worldId === mockWorld(mockedWorld).id) {
			return
		}
		throw new Error('Unauthorized')
	})

	return requestBuilder
}

export const requestBuilder = {
	get: sendGet,
	post: sendPost,
	patch: sendPatch,
	delete: sendDelete,
	withWorld,
	withCollaboratingUser,
	withUserAuth,
	withWorldReadAccess,
	withWorldWriteAccess,
}

beforeEach(() => {
	vi.restoreAllMocks()
})
