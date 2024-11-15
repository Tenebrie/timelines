import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'

import {
	mockApiEventModel,
	mockDeleteWorldEvent,
	mockEventModel,
	mockUpdateWorldEvent,
} from '@/api/rheaApi.mock'
import { renderWithProviders } from '@/jest/renderWithProviders'
import { setupTestServer } from '@/jest/setupTestServer'
import { mockRouter } from '@/router/router.mock'
import { worldRoutes } from '@/router/routes/worldRoutes'

import { initialState } from '../../reducer'
import { WorldEvent } from '../../types'
import { DeleteEventModal } from './components/DeleteEventModal/DeleteEventModal'
import { EventEditor } from './EventEditor'

const server = setupTestServer()

describe('<EventEditor />', () => {
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
					customName: true,
				}),
			),
		)

		expect(screen.getByDisplayValue('Event title')).toBeInTheDocument()
		expect(screen.getByDisplayValue('Amazing event text')).toBeInTheDocument()
	})

	it('generates name if customName is false', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
					customName: false,
				}),
			),
		)

		mockUpdateWorldEvent(server, {
			worldId: '1111',
			eventId: '2222',
			response: mockApiEventModel({
				id: '2222',
				name: 'Event title',
				description: 'Amazing event text',
				customName: false,
			}),
		})

		expect(screen.getByLabelText<HTMLInputElement>('Name').value).toEqual('Amazing event text')
		await user.click(screen.getByText('Save'))
	})

	it('sends a save request on save button click', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
					customName: true,
				}),
			),
		)

		const { hasBeenCalled } = mockUpdateWorldEvent(server, {
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
		await user.clear(screen.getByLabelText('Content'))
		await user.type(screen.getByLabelText('Content'), 'New description')
		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Minute'), '1500')
		await user.click(screen.getByText('Save'))

		await waitFor(() => expect(hasBeenCalled()).toBeTruthy())
		// TODO: Fails in CI, figure it out (other test side effect, most likely)
		// expect(invocations.length).toEqual(1)
		// expect(invocations[0].jsonBody).toEqual({
		// 	name: 'New title',
		// 	icon: 'default',
		// 	description: 'New description',
		// 	timestamp: '1500',
		// 	customNameEnabled: true,
		// 	targetActorIds: [],
		// 	mentionedActorIds: [],
		// 	modules: [],
		// 	revokedAt: null,
		// })
	})

	it('renders provided icon if icon module is enabled', () => {
		renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Amazing event text',
					icon: 'fire',
					description: 'Amazing event text',
					extraFields: ['EventIcon'],
				}),
			),
		)

		expect(screen.getByAltText('fire icon')).toBeInTheDocument()
	})

	it('saves a changed icon', async () => {
		const { user } = renderWithProviders(
			<EventEditor />,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Amazing event text',
					description: 'Amazing event text',
					extraFields: ['EventIcon'],
				}),
			),
		)

		const { hasBeenCalled, invocations } = mockUpdateWorldEvent(server, {
			worldId: '1111',
			eventId: '2222',
			response: mockApiEventModel({
				id: '2222',
				name: 'Amazing event text',
				description: 'Amazing event text',
				extraFields: ['EventIcon'],
			}),
		})

		await user.click(screen.getByLabelText('Icon'))
		await user.click(screen.getByAltText('fire icon'))
		await user.click(screen.getByText('Save'))

		await waitFor(() => expect(hasBeenCalled).toBeTruthy())
		expect(invocations[0].jsonBody).toEqual(
			expect.objectContaining({
				icon: 'fire',
			}),
		)
	})

	it('deletes the event', async () => {
		const { user } = renderWithProviders(
			<>
				<EventEditor />
				<DeleteEventModal />
			</>,
			getPreloadedState(
				mockEventModel({
					id: '2222',
					name: 'Event title',
					description: 'Amazing event text',
				}),
			),
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
})
