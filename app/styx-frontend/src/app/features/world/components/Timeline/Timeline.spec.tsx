import { screen } from '@testing-library/react'

import { mockEventModel } from '@/api/rheaApi.mock'
import { PreferencesInitialState } from '@/app/features/preferences/reducer'
import { renderWithProviders } from '@/jest/renderWithProviders'
import { mockRouter } from '@/router/router.mock'
import { worldRoutes } from '@/router/routes/worldRoutes'

import { initialState } from '../../reducer'
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
			preferences: {
				...PreferencesInitialState,
				timeline: {
					...PreferencesInitialState.timeline,
					lineSpacing: 10,
				},
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

	it('renders the labels for countup calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'COUNTUP' }))

		expect(screen.getByText('18:00')).toBeInTheDocument()
		expect(screen.getByText('Day 1')).toBeInTheDocument()
		expect(screen.getByText('06:00')).toBeInTheDocument()
	})

	it('renders the labels for earth calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'EARTH' }))

		expect(screen.getByText('18:00')).toBeInTheDocument()
		expect(screen.getByText('January 01, 2023')).toBeInTheDocument()
		expect(screen.getByText('06:00')).toBeInTheDocument()
	})

	it('renders the label for pf2e calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'PF2E' }))

		expect(screen.getByText('18:00')).toBeInTheDocument()
		expect(screen.getByText('(01) Abadius 01, 4723')).toBeInTheDocument()
		expect(screen.getByText('06:00')).toBeInTheDocument()
	})

	it('renders the label for rimworld calendar world', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'RIMWORLD' }))

		expect(screen.getByText('18:00')).toBeInTheDocument()
		expect(screen.getByText('Aprimay 01, 5500')).toBeInTheDocument()
		expect(screen.getByText('06:00')).toBeInTheDocument()
	})

	it('respects the world time origin', async () => {
		renderWithProviders(<Timeline />, getPreloadedState([], { calendar: 'COUNTUP', timeOrigin: '100000' }))

		expect(screen.getByText('Day 70')).toBeInTheDocument()
	})
})
