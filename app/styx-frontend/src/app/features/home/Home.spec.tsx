// @ts-nocheck
import { waitFor } from '@testing-library/react'

import {
	mockAuthenticatedUser,
	mockCheckAuthentication,
	mockGetWorlds,
	mockUserModel,
} from '@/api/rheaApi.mock'
import { renderWithRouter } from '@/test-utils/renderWithProviders'
import { setupTestServer } from '@/test-utils/setupTestServer'

const server = setupTestServer()

describe.skip('<Home />', () => {
	describe('with navigation', () => {
		it('redirects over to login if user is not authenticated', async () => {
			mockCheckAuthentication(server, {
				response: {
					authenticated: false,
					sessionId: 'sessionId',
					user: mockUserModel(),
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
