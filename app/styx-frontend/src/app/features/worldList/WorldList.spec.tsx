import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
	mockCreateWorld,
	mockDeleteWorld,
	mockGetWorlds,
	mockUserModel,
	mockWorldItemModel,
} from '@/api/rheaApi.mock'
import { renderWithProviders } from '@/jest/renderWithProviders'

import { initialState } from '../auth/reducer'
import { WorldList } from './WorldList'

const server = setupServer()

const preloadedState = {
	preloadedState: {
		auth: {
			...initialState,
			user: mockUserModel(),
		},
	},
}

describe('<WorldList />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	it('renders list of worlds', async () => {
		renderWithProviders(<WorldList />, preloadedState)

		mockGetWorlds(server, {
			response: {
				ownedWorlds: [
					mockWorldItemModel({ name: 'My First World' }),
					mockWorldItemModel({ name: 'My Second World' }),
					mockWorldItemModel({ name: 'My Third World' }),
				],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		expect(await screen.findByText('- My First World')).toBeInTheDocument()
		expect(await screen.findByText('- My Second World')).toBeInTheDocument()
		expect(await screen.findByText('- My Third World')).toBeInTheDocument()
		expect(screen.queryByText('Nothing has been created yet!')).not.toBeInTheDocument()
	})

	it('renders empty state if no worlds are provided', async () => {
		renderWithProviders(<WorldList />, preloadedState)

		mockGetWorlds(server, {
			response: {
				ownedWorlds: [],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		expect(await screen.findByText('Nothing has been created yet!')).toBeInTheDocument()
	})

	it('creates a world', async () => {
		const { user } = renderWithProviders(<WorldList />, preloadedState)

		mockGetWorlds(server, {
			response: {
				ownedWorlds: [],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		await user.click(await screen.findByText('Create new world...'))

		expect(screen.getByText('Create world')).toBeInTheDocument()

		server.resetHandlers()
		const newWorld = mockWorldItemModel({ name: 'New World' })
		const { invocations } = mockCreateWorld(server, {
			response: newWorld,
		})
		mockGetWorlds(server, {
			response: {
				ownedWorlds: [newWorld],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		await user.type(screen.getByLabelText('Name'), 'New World')
		await user.click(screen.getByText('Confirm'))

		await waitFor(() => expect(screen.queryByText('Create world')).not.toBeInTheDocument())
		expect(await screen.findByText('- New World')).toBeInTheDocument()
		expect(invocations[0].jsonBody).toEqual({
			name: 'New World',
			description: '',
			calendar: 'EARTH',
			timeOrigin: 0,
		})
	})

	it('creates a world with PF2E calendar and time origin', async () => {
		mockGetWorlds(server, {
			response: {
				ownedWorlds: [],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		const { user } = renderWithProviders(<WorldList />, preloadedState)

		const { invocations } = mockCreateWorld(server, {
			response: mockWorldItemModel(),
		})

		await user.click(await screen.findByText('Create new world...'))
		await user.type(screen.getByLabelText('Name'), 'New World')
		await user.click(screen.getByLabelText('Calendar'))
		await user.click(screen.getByText('Golarion Calendar (Pathfinder)'))
		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Minute'), '100')
		await user.click(screen.getByText('Confirm'))

		await waitFor(() => expect(screen.queryByText('Create world')).not.toBeInTheDocument())
		expect(invocations[0].jsonBody).toEqual({
			name: 'New World',
			description: '',
			calendar: 'PF2E',
			timeOrigin: 100,
		})
	})

	it('fails to create a world when the name is empty', async () => {
		const { user } = renderWithProviders(<WorldList />, preloadedState)

		mockGetWorlds(server, {
			response: {
				ownedWorlds: [],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		const { hasBeenCalled } = mockCreateWorld(server, {
			response: mockWorldItemModel(),
		})

		await user.click(await screen.findByText('Create new world...'))
		await user.click(screen.getByText('Confirm'))

		expect(await screen.findByText("Field can't be empty")).toBeInTheDocument()
		expect(hasBeenCalled()).toBeFalsy()
	})

	it('deletes a world', async () => {
		const { user } = renderWithProviders(<WorldList />, preloadedState)

		const worlds = [
			mockWorldItemModel({ name: 'My First World' }),
			mockWorldItemModel({ name: 'My Second World' }),
			mockWorldItemModel({ name: 'My Third World' }),
		]

		mockGetWorlds(server, {
			response: {
				ownedWorlds: worlds,
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		expect((await screen.findAllByTestId('DeleteIcon'))[0]).toBeInTheDocument()
		await user.click((await screen.findAllByTestId('DeleteIcon'))[0])

		expect(screen.getByText('Delete world')).toBeInTheDocument()

		server.resetHandlers()
		const { hasBeenCalled } = mockDeleteWorld(server, {
			worldId: worlds[0].id,
			response: worlds[0],
		})
		mockGetWorlds(server, {
			response: {
				ownedWorlds: [worlds[1], worlds[2]],
				contributableWorlds: [],
				visibleWorlds: [],
			},
		})

		await user.click(screen.getByText('Confirm'))

		await waitFor(() => expect(screen.queryByText('- My First World')).not.toBeInTheDocument())
		expect(await screen.findByText('- My Second World')).toBeInTheDocument()
		expect(await screen.findByText('- My Third World')).toBeInTheDocument()
		await waitFor(() => expect(hasBeenCalled()).toBeTruthy())
	})
})
