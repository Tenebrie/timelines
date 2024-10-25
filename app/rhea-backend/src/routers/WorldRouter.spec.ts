import { mockToResponse, mockUser, mockWorld, withUserAuth, withWorld } from '@src/mock'

describe('WorldRouter', () => {
	describe('GET /api/world/:worldId', () => {
		it('returns world data', async () => {
			const user = mockUser()
			const world = mockWorld()

			const response = await withUserAuth()
				.withWorld(world)
				.withWorldReadAccess(user, world)
				.get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(200)
			expect(response.body).toEqual(mockToResponse(world))
		})

		it('does not return data to unauthenticated user', async () => {
			const world = mockWorld()

			const response = await withWorld(world).get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(400)
			expect(response.body).toEqual({
				status: 400,
				reason: 'Bad Request',
				message: "Missing cookie params: 'user-jwt-token' (Any string value with at least one character)",
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
			expect(response.body).toEqual(mockToResponse(world))
		})

		it('allows access to publicly shared wiki world', async () => {
			const world = mockWorld({
				accessMode: 'PublicEdit',
			})

			const response = await withUserAuth().withWorld(world).get(`/api/world/${world.id}`)

			expect(response.statusCode).toEqual(200)
			expect(response.body).toEqual(mockToResponse(world))
		})
	})
})
