import { waitFor } from '@testing-library/react'

import { mockCheckAuthentication, mockUserModel } from '@/api/rheaApi.mock'
import { renderWithRouter } from '@/jest/renderWithProviders'
import { setupTestServer } from '@/jest/setupTestServer'
import { appRoutes } from '@/router/routes/appRoutes'

const server = setupTestServer()

describe('<Limbo />', () => {
	describe('with navigation', () => {
		it('redirects over to login if user is not authenticated', async () => {
			mockCheckAuthentication(server, {
				response: {
					authenticated: false,
					user: mockUserModel(),
					sessionId: 'sessionId',
				},
			})

			await renderWithRouter('limbo')
			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.login))
		})

		it('redirects over to home if user is authenticated', async () => {
			mockCheckAuthentication(server, {
				response: {
					authenticated: true,
					user: mockUserModel(),
					sessionId: 'sessionId',
				},
			})

			await renderWithRouter('limbo')
			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
		})
	})
})
