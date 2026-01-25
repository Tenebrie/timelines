import { mockToResponse, mockUser, mockWorld, withUserAuth, withWorld } from '@src/mock/index.js'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@src/ts-shared/node/services/SecretService', () => {
	return {
		SecretService: {
			getSecret: vi.fn((secretName) => {
				if (secretName === 'jwt-secret') {
					return 'secretkey'
				}
				if (secretName === 'environment') {
					return 'development'
				}
				if (secretName === 's3-endpoint') {
					return 'http://localhost:9000'
				}
				if (secretName === 's3-bucket-id') {
					return 'test-bucket'
				}
				if (secretName === 's3-access-key-id') {
					return 'secret'
				}
				if (secretName === 's3-access-key-secret') {
					return 'secret'
				}
				throw new Error(`Secret ${secretName} not found`)
			}),
		},
	}
})

describe('WorldRouter', () => {
	describe('GET /api/world/:worldId', () => {
		it('returns world data to the owner', async () => {
			const user = mockUser()
			const world = mockWorld({
				ownerId: user.id,
			})

			const response = await withUserAuth()
				.withWorld(world)
				.withWorldWriteAccess(user, world)
				.get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(200)
			expect(response.body).toEqual({
				...mockToResponse(world),
				isReadOnly: false,
			})
		})

		// TODO: Fix mock
		// it('returns world data to a collaborator', async () => {
		// 	const user = mockUser()
		// 	const world = mockWorld()

		// 	const response = await withUserAuth()
		// 		.withWorld(world)
		// 		.withCollaboratingUser({ userId: user.id, worldId: world.id, access: 'Editing' })
		// 		.withWorldWriteAccess(user, world)
		// 		.get(`/api/world/${world.id}`)

		// 	expect(response.statusCode).toEqual(200)
		// 	expect(response.body).toEqual({
		// 		...mockToResponse(world),
		// 		isReadOnly: false,
		// 	})
		// })

		it('does not return data to unauthenticated user', async () => {
			const world = mockWorld()

			const response = await withWorld(world).get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(401)
			expect(response.body).toEqual({
				status: 401,
				reason: 'Unauthorized',
				message: 'No access to this world',
			})
		})

		it('does not return data to user without access', async () => {
			const world = mockWorld()

			const response = await withUserAuth().withWorld(world).get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(401)
			expect(response.body).toEqual({
				status: 401,
				reason: 'Unauthorized',
				message: 'No access to this world',
			})
		})

		it('allows access to publicly shared read-only world', async () => {
			const world = mockWorld({
				accessMode: 'PublicRead',
			})

			const response = await withUserAuth().withWorld(world).get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(200)
			expect(response.body).toEqual({
				...mockToResponse(world),
				isReadOnly: true,
			})
		})

		it('allows access to publicly shared wiki world', async () => {
			const world = mockWorld({
				accessMode: 'PublicEdit',
			})

			const response = await withUserAuth().withWorld(world).get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(200)
			expect(response.body).toEqual({
				...mockToResponse(world),
				isReadOnly: false,
			})
		})
	})
})
