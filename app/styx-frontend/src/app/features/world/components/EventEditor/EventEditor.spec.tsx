import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { setupServer } from 'msw/lib/node'

import {
	mockApiEventModel,
	mockDeleteWorldEvent,
	mockEventModel,
	mockUpdateWorldEvent,
} from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { initialState } from '../../reducer'
import { worldRoutes } from '../../router'
import { mockRouter } from '../../router.mock'
import { WorldEvent } from '../../types'
import { EventEditor } from './EventEditor'

const server = setupServer()

describe('<EventEditor />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	const getPreloadedState = (event: WorldEvent) => ({
		preloadedState: {
			world: {
				...initialState,
				events: [event],
			},
		},
	})

	beforeAll(() => {
		mockRouter(worldRoutes.eventEditor, {
			worldId: '1111',
			eventId: '2222',
		})
	})

	it('renders the statement data', () => {
		renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				})
			)
		)

		expect(screen.getByDisplayValue('Event title')).toBeInTheDocument()
		expect(screen.getByDisplayValue('Amazing event text')).toBeInTheDocument()
		expect(screen.getByText('Issued statements')).toBeInTheDocument()
		expect(screen.getByText('Revoked statements')).toBeInTheDocument()
	})

	it('sends a save request on save button click', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				})
			)
		)

		const { hasBeenCalled, invocations } = mockUpdateWorldEvent(server, {
			worldId: '1111',
			eventId: '2222',
			response: mockApiEventModel({
				id: '2222',
				name: 'New title',
				description: 'New description',
			}),
		})

		await user.clear(screen.getByLabelText('Name'))
		await user.type(screen.getByLabelText('Name'), 'New title')
		await user.clear(screen.getByLabelText('Description'))
		await user.type(screen.getByLabelText('Description'), 'New description')
		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Minute'), '1500')
		await user.click(screen.getByText('Save'))

		await waitFor(() => expect(hasBeenCalled()).toBeTruthy())
		expect(invocations[0].jsonBody).toEqual({
			name: 'New title',
			icon: 'default',
			description: 'New description',
			timestamp: 1500,
		})
		expect(invocations.length).toEqual(1)
	})

	it('renders provided icon', () => {
		renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					icon: 'fire',
					description: 'Amazing event text',
				})
			)
		)

		expect(screen.getByAltText('fire icon')).toBeInTheDocument()
	})

	it('saves a changed icon', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				})
			)
		)

		const { hasBeenCalled, invocations } = mockUpdateWorldEvent(server, {
			worldId: '1111',
			eventId: '2222',
			response: mockApiEventModel({
				id: '2222',
				name: 'New title',
				description: 'New description',
			}),
		})

		await user.click(screen.getByLabelText('Icon'))
		await user.click(screen.getByAltText('fire icon'))
		await user.click(screen.getByText('Save'))

		await waitFor(() => expect(hasBeenCalled).toBeTruthy())
		expect(invocations[0].jsonBody).toEqual(
			expect.objectContaining({
				icon: 'fire',
			})
		)
	})

	it('deletes the statement', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				})
			)
		)

		const { hasBeenCalled } = mockDeleteWorldEvent(server, {
			worldId: '1111',
			eventId: '2222',
			response: mockApiEventModel({
				id: '2222',
				name: 'Event title',
				description: 'Amazing event text',
			}),
		})

		await user.click(screen.getByText('Delete'))
		await user.click(screen.getByText('Confirm'))

		expect(screen.getByText('Delete Event')).toBeInTheDocument()
		await waitForElementToBeRemoved(() => screen.queryByText('Delete Event'))
		expect(hasBeenCalled).toBeTruthy()
	})

	it('opens the issued statement wizard', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				})
			)
		)

		const addButtons = screen.getAllByTestId('AddIcon')

		await user.click(addButtons[0])
		await user.click(screen.getByText('World Statement'))

		expect(screen.getByText('Issue Statement')).toBeInTheDocument()
	})

	it('opens the revoked statement wizard', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				})
			)
		)

		const addButtons = screen.getAllByTestId('AddIcon')

		await user.click(addButtons[1])

		expect(screen.getByText('Revoke Statement')).toBeInTheDocument()
	})
})
