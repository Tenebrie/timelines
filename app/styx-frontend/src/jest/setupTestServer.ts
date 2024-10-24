import { setupServer } from 'msw/node'

import { mockGetAnnouncements, mockGetWorlds } from '../api/rheaApi.mock'

export const setupTestServer = () => {
	const server = setupServer()
	beforeAll(() => server.listen())
	beforeEach(() => {
		mockGetWorlds(server, {
			response: {
				ownedWorlds: [],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		mockGetAnnouncements(server, {
			response: [],
		})
	})
	afterEach(() => {
		server.resetHandlers()
	})
	afterAll(() => server.close())

	return server
}
