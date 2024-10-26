import { CollaboratingUser, User, World } from '@prisma/client'
import { AuthorizationService } from '@src/services/AuthorizationService'
import * as request from 'supertest'

import { app } from '..'
import { withUserAuth } from './auth'
import { mockCollaboratingUser, mockUser, mockWorld } from './mock'
import { prismaMock } from './utils/prismaMock'

export const makeRequest = () => request(app.callback())
export const sendGet = (...args: Parameters<ReturnType<typeof request>['get']>) => makeRequest().get(...args)
export const sendPost = (...args: Parameters<ReturnType<typeof request>['post']>) =>
	makeRequest().post(...args)
export const sendPatch = (...args: Parameters<ReturnType<typeof request>['patch']>) =>
	makeRequest().patch(...args)
export const sendDelete = (...args: Parameters<ReturnType<typeof request>['delete']>) =>
	makeRequest().delete(...args)

export const withWorld = (world?: Partial<World>) => {
	prismaMock.world.findFirst.mockResolvedValue(mockWorld(world))
	prismaMock.world.findFirstOrThrow.mockResolvedValue(mockWorld(world))

	return requestBuilder
}

export const withCollaboratingUser = (data?: Partial<CollaboratingUser>) => {
	prismaMock.collaboratingUser.findFirst.mockResolvedValue(mockCollaboratingUser(data))
	prismaMock.collaboratingUser.findFirstOrThrow.mockResolvedValue(mockCollaboratingUser(data))

	return requestBuilder
}

export const withWorldReadAccess = (mockedUser?: Partial<User>, mockedWorld?: Partial<World>) => {
	jest.spyOn(AuthorizationService, 'checkUserReadAccessById').mockImplementation(async (user, worldId) => {
		if (user?.id === mockUser(mockedUser).id && worldId === mockWorld(mockedWorld).id) {
			return
		}
		throw new Error('Unauthorized')
	})

	return requestBuilder
}

export const withWorldWriteAccess = (mockedUser?: Partial<User>, mockedWorld?: Partial<World>) => {
	jest.spyOn(AuthorizationService, 'checkUserReadAccessById').mockImplementation(async (user, worldId) => {
		if (user?.id === mockUser(mockedUser).id && worldId === mockWorld(mockedWorld).id) {
			return
		}
		throw new Error('Unauthorized')
	})
	jest.spyOn(AuthorizationService, 'checkUserWriteAccessById').mockImplementation(async (user, worldId) => {
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
	jest.restoreAllMocks()
})
