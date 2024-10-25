import { mockToResponse, mockUser, mockWorld, withUserAuth } from '@src/mock'

describe('WorldRouter', () => {
	describe('GET /api/world/:worldId', () => {
		it('returns world data', async () => {
			const user = mockUser()
			const world = mockWorld()

			const response = await withUserAuth()
				.withWorld(world)
				.withWorldReadAccess(user, world)
				.get(`/api/world/${world.id}`)

			expect(response.body).toEqual(mockToResponse(world))
		})
	})
})
