import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
	mockCreateWorld,
	mockDeleteWorld,
	mockGetWorlds,
	mockWorldItemModel,
} from '../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../jest/renderWithProviders'
import { WorldList } from './WorldList'

const server = setupServer()

describe('<WorldList />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	it('renders list of worlds', async () => {
		renderWithProviders(<WorldList />)

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
		const { user } = renderWithProviders(<WorldList />)

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
			calendar: 'COUNTUP',
			timeOrigin: 0,
		})
	})

	it('creates a world with earth calendar and time origin', async () => {
		const { user } = renderWithProviders(<WorldList />)

		mockGetWorlds(server, { response: [] })
		const { invocations } = mockCreateWorld(server, {
			response: mockWorldItemModel(),
		})

		await user.click(await screen.findByText('Create new world...'))
		await user.type(screen.getByLabelText('Name'), 'New World')
		await user.click(screen.getByLabelText('Calendar'))
		await user.click(screen.getByText('Earth Calendar'))
		await user.type(screen.getByLabelText('Time Origin'), '100')
		await user.click(screen.getByText('Confirm'))

		await waitFor(() => expect(screen.queryByText('Create world')).not.toBeInTheDocument())
		expect(invocations[0].jsonBody).toEqual({
			name: 'New World',
			calendar: 'EARTH',
			timeOrigin: 100,
		})
	})

	it('fails to create a world when the name is empty', async () => {
		const { user } = renderWithProviders(<WorldList />)

		mockGetWorlds(server, { response: [] })
		const { hasBeenCalled } = mockCreateWorld(server, {
			response: mockWorldItemModel(),
		})

		await user.click(await screen.findByText('Create new world...'))
		await user.click(screen.getByText('Confirm'))

		expect(await screen.findByText("Field can't be empty")).toBeInTheDocument()
		expect(hasBeenCalled()).toBeFalsy()
	})

	it('deletes a world', async () => {
		const { user } = renderWithProviders(<WorldList />)

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
})
