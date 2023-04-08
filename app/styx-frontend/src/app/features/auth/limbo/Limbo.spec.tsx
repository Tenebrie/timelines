import { waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockCheckAuthentication, mockGetWorlds } from '../../../../api/rheaApi.mock'
import { renderWithRouter } from '../../../../jest/renderWithProviders'
import { appRoutes } from '../../world/router'

const server = setupServer()

describe('<Limbo />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	describe('with navigation', () => {
		it('redirects over to login if user is not authenticated', async () => {
			renderWithRouter('limbo')

			mockCheckAuthentication(server, {
				response: {
					authenticated: false,
				},
			})

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.login))
		})

		it('redirects over to home if user is authenticated', async () => {
			renderWithRouter('limbo')

			mockCheckAuthentication(server, {
				response: {
					authenticated: true,
				},
			})
			mockGetWorlds(server, {
				response: [],
			})

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
		})
	})
})
