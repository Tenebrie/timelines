import { waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockAuthenticatedUser, mockCheckAuthentication, mockGetWorlds } from '../../../api/rheaApi.mock'
import { renderWithRouter } from '../../../jest/renderWithProviders'
import { appRoutes } from '../world/router'

const server = setupServer()

describe('<Home />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	describe('with navigation', () => {
		it('redirects over to login if user is not authenticated', async () => {
			mockCheckAuthentication(server, {
				response: {
					authenticated: false,
				},
			})
			mockGetWorlds(server, {
				response: [],
			})

			await renderWithRouter('home')

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.login))
		})

		it('does not redirect if user is authenticated', async () => {
			mockAuthenticatedUser(server)
			mockGetWorlds(server, {
				response: [],
			})

			await renderWithRouter('home')

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
		})
	})
})
