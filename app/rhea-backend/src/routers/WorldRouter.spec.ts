import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { prismaMock, sendGet, withAuth } from '@src/mock/PrismaMock'
import { mockWorld } from '@src/mock/WorldMocks'

describe('WorldRouter', () => {
	// const runner = WorldRouter.testUtils()

	describe('GET /api/world/:worldId', () => {
		it('returns world data', async () => {
			const world = mockWorld()

			prismaMock.world.findFirstOrThrow.mockResolvedValue(world)

			const response = await withAuth(UserAuthenticator).get(`/api/world/${world.id}`)
			expect(response.body).toEqual(world)
		})
	})
})
