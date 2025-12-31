import { setupServer } from 'msw/node'

import { mockGetAnnouncements, mockGetWorlds } from '../api/mock/rheaApi.mock'

export const setupTestServer = () => {
	const server = setupServer()
	beforeAll(() => {
		server.listen({ onUnhandledRequest: 'error' })
	})
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
