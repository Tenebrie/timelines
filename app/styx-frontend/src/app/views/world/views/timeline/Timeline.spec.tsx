// @ts-nocheck
import { WorldDetails, WorldEvent } from '@api/types/types'
import { screen, waitFor } from '@testing-library/react'

import { mockEventModel } from '@/api/mock/rheaApi.mock'
import { initialState } from '@/app/views/world/WorldSlice'
import { mockRouter } from '@/router-utils/router.mock'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

import { Timeline } from './Timeline'

describe.skip('<Timeline />', () => {
	const getPreloadedState = (events: WorldEvent[], worldOptions: Partial<WorldDetails> = {}) => ({
		preloadedState: {
			world: {
				...initialState,
				id: '1111',
				isLoaded: true,
				...worldOptions,
				events,
			},
		},
	})

	beforeAll(() => {
		mockRouter(worldTimelineRoutes.timelineRoot, {
			worldId: '1111',
		})
	})

	it('renders the provided events', () => {
		renderWithProviders(
			<Timeline />,
			getPreloadedState([
				mockEventModel({ name: 'First event', timestamp: 0 }),
				mockEventModel({ name: 'Second event', timestamp: 100 }),
			]),
		)

		expect(screen.getAllByTestId('timeline-event-marker').length).toEqual(2)
	})

	it('does not render an event off-screen', () => {
		renderWithProviders(
			<Timeline />,
			getPreloadedState([mockEventModel({ name: 'Invisible event', timestamp: 100000 })]),
		)

		expect(screen.queryByTestId('timeline-event-marker')).not.toBeInTheDocument()
	})

	it('renders the labels for earth calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'EARTH' }))

		expect(screen.getByText('January 01, 2023')).toBeInTheDocument()
	})

	it('renders the label for pf2e calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'PF2E' }))

		expect(screen.getByText('(01) Abadius 01, 4723')).toBeInTheDocument()
	})

	it('renders the label for rimworld calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'RIMWORLD' }))

		expect(screen.getByText('Aprimay 01, 5500')).toBeInTheDocument()
	})

	it('respects the world time origin', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'PF2E', timeOrigin: '100000' }))

		waitFor(async () => expect(await screen.findByText('(03) Pharast 11, 4723')).toBeInTheDocument())
	})
})
