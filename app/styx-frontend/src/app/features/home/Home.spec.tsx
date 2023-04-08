import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
	mockAuthenticatedUser,
	mockCheckAuthentication,
	mockCreateWorld,
	mockDeleteWorld,
	mockGetWorlds,
	mockWorldItemModel,
} from '../../../api/rheaApi.mock'
import { renderWithProviders, renderWithRouter } from '../../../jest/renderWithProviders'
import { appRoutes } from '../world/router'
import { Home } from './Home'

const server = setupServer()

describe('<Home />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	it('renders list of worlds', async () => {
		renderWithProviders(<Home />)

		mockGetWorlds(server, {
			response: [
				mockWorldItemModel({ name: 'My First World' }),
				mockWorldItemModel({ name: 'My Second World' }),
				mockWorldItemModel({ name: 'My Third World' }),
			],
		})

		expect(await screen.findByText('- My First World')).toBeInTheDocument()
		expect(await screen.findByText('- My Second World')).toBeInTheDocument()
		expect(await screen.findByText('- My Third World')).toBeInTheDocument()
	})

	it('creates a world', async () => {
		const { user } = renderWithProviders(<Home />)

		mockGetWorlds(server, { response: [] })

		await user.click(await screen.findByText('Create new world...'))

		expect(screen.getByText('Create world')).toBeInTheDocument()

		server.resetHandlers()
		const newWorld = mockWorldItemModel({ name: 'New World' })
		const { invocations } = mockCreateWorld(server, {
			response: newWorld,
		})
		mockGetWorlds(server, {
			response: [newWorld],
		})

		await user.type(screen.getByLabelText('Name'), 'New World')
		await user.click(screen.getByText('Confirm'))

		await waitFor(() => expect(screen.queryByText('Create world')).not.toBeInTheDocument())
		expect(await screen.findByText('- New World')).toBeInTheDocument()
		expect(invocations[0].jsonBody).toEqual({
			name: 'New World',
		})
	})

	it('deletes a world', async () => {
		const { user } = renderWithProviders(<Home />)

		const worlds = [
			mockWorldItemModel({ name: 'My First World' }),
			mockWorldItemModel({ name: 'My Second World' }),
			mockWorldItemModel({ name: 'My Third World' }),
		]

		mockGetWorlds(server, { response: worlds })

		expect((await screen.findAllByTestId('DeleteIcon'))[0]).toBeInTheDocument()
		await user.click((await screen.findAllByTestId('DeleteIcon'))[0])

		expect(screen.getByText('Delete world')).toBeInTheDocument()

		server.resetHandlers()
		const { hasBeenCalled } = mockDeleteWorld(server, {
			worldId: worlds[0].id,
			response: worlds[0],
		})
		mockGetWorlds(server, {
			response: [worlds[1], worlds[2]],
		})

		await user.click(screen.getByText('Confirm'))

		await waitFor(() => expect(screen.queryByText('- My First World')).not.toBeInTheDocument())
		expect(await screen.findByText('- My Second World')).toBeInTheDocument()
		expect(await screen.findByText('- My Third World')).toBeInTheDocument()
		await waitFor(() => expect(hasBeenCalled()).toBeTruthy())
	})

	describe('with navigation', () => {
		it('redirects over to login if user is not authenticated', async () => {
			renderWithRouter('home')

			mockCheckAuthentication(server, {
				response: {
					authenticated: false,
				},
			})
			mockGetWorlds(server, {
				response: [],
			})

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.login))
		})

		it('does not redirect if user is authenticated', async () => {
			renderWithRouter('home')

			mockAuthenticatedUser(server)
			mockGetWorlds(server, {
				response: [],
			})

			await waitFor(() => expect(window.location.pathname).toEqual(appRoutes.home))
		})
	})
})
