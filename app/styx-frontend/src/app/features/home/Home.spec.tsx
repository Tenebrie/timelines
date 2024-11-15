import { waitFor } from '@testing-library/react'

import { mockAuthenticatedUser, mockCheckAuthentication, mockGetWorlds } from '@/api/rheaApi.mock'
import { renderWithRouter } from '@/jest/renderWithProviders'
import { setupTestServer } from '@/jest/setupTestServer'
import { appRoutes } from '@/router/routes/appRoutes'

const server = setupTestServer()

describe('<Home />', () => {
	describe('with navigation', () => {
		it('redirects over to login if user is not authenticated', async () => {
			mockCheckAuthentication(server, {
				response: {
					authenticated: false,
				},
			})
			mockGetWorlds(server, {
				response: {
					ownedWorlds: [],
					contributableWorlds: [],
					visibleWorlds: [],
				},
			})

			await renderWithRouter('home')

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.login))
		})

		it('does not redirect if user is authenticated', async () => {
			mockAuthenticatedUser(server)

			await renderWithRouter('home')

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
		})
	})
})
