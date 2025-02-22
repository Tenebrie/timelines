// @ts-nocheck
import { waitFor } from '@testing-library/react'

import { mockCheckAuthentication, mockUserModel } from '@/api/rheaApi.mock'
import { renderWithRouter } from '@/test-utils/renderWithProviders'
import { setupTestServer } from '@/test-utils/setupTestServer'

const server = setupTestServer()

describe.skip('<Limbo />', () => {
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
