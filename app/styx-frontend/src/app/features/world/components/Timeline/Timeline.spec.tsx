import { screen } from '@testing-library/react'

import { mockEventModel } from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { initialState } from '../../reducer'
import { worldRoutes } from '../../router'
import { mockRouter } from '../../router.mock'
import { WorldDetails, WorldEvent } from '../../types'
import { Timeline } from './Timeline'

describe('<Timeline />', () => {
	const getPreloadedState = (events: WorldEvent[], worldOptions: Partial<WorldDetails> = {}) => ({
		preloadedState: {
			world: {
				...initialState,
				isLoaded: true,
				...worldOptions,
				events,
			},
		},
	})

	beforeAll(() => {
		mockRouter(worldRoutes.root, {
			worldId: '1111',
		})
	})

	it('renders the provided events', () => {
		renderWithProviders(
			<Timeline />,
			getPreloadedState([
				mockEventModel({ name: 'First event', timestamp: 0 }),
				mockEventModel({ name: 'Second event', timestamp: 100 }),
			])
		)

		expect(screen.getAllByTestId('timeline-event-marker').length).toEqual(2)
	})

	it('does not render an event off-screen', () => {
		renderWithProviders(
			<Timeline />,
			getPreloadedState([mockEventModel({ name: 'Invisible event', timestamp: 100000 })])
		)

		expect(screen.queryByTestId('timeline-event-marker')).not.toBeInTheDocument()
	})

	it('renders the label for countup calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([]))

		expect(screen.getByText('Year 0, Day 0, 00:00')).toBeInTheDocument()
		expect(screen.queryByText('2023.01.01 00:00')).not.toBeInTheDocument()
	})

	it('renders the label for earth calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'EARTH' }))

		expect(screen.getByText('2023.01.01 00:00')).toBeInTheDocument()
		expect(screen.queryByText('Year 0, Day 0, 00:00')).not.toBeInTheDocument()
	})

	it('respects the world time origin', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { timeOrigin: 100000 }))

		expect(screen.getByText('Year 0, Day 69, 00:00')).toBeInTheDocument()
		expect(screen.queryByText('Year 0, Day 0, 00:00')).not.toBeInTheDocument()
	})
})
