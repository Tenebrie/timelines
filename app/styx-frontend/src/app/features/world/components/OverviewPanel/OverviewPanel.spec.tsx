import { screen, waitFor, within } from '@testing-library/react'

import { mockActorModel, mockEventModel, mockStatementModel } from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { initialState } from '../../reducer'
import { worldRoutes } from '../../router'
import { MockedRouter, mockRouter, resetMockRouter } from '../../router.mock'
import { WorldDetails } from '../../types'
import { OverviewPanel } from './OverviewPanel'

describe('<OverviewPanel />', () => {
	const getPreloadedState = (worldOptions: Partial<WorldDetails>) => ({
		preloadedState: {
			world: {
				...initialState,
				isLoaded: true,
				...worldOptions,
			},
		},
	})

	beforeAll(() => {
		mockRouter(worldRoutes.root, {
			worldId: '1111',
		})
	})

	beforeEach(() => {
		resetMockRouter()
	})

	afterEach(() => {
		resetMockRouter()
	})

	describe('actors', () => {
		it('renders provided actors', () => {
			renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [
						mockEventModel({ name: 'My First Event', timestamp: 1500 }),
						mockEventModel({ name: 'My Second Event', timestamp: 2500 }),
					],
				})
			)

			expect(screen.getByText('My First Event')).toBeInTheDocument()
			expect(screen.getByText('My Second Event')).toBeInTheDocument()
		})

		it('renders provided actors in provided order', () => {
			renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					actors: [
						mockActorModel({ name: 'AAA First Actor', color: '#008080' }),
						mockActorModel({ name: 'BBB Second Actor', color: '#008080' }),
						mockActorModel({ name: 'CCC Third Actor', color: '#008080' }),
						mockActorModel({ name: 'AAA Fourth Actor', color: '#b0bec5' }),
						mockActorModel({ name: 'BBB Fifth Actor', color: '#b0bec5' }),
						mockActorModel({ name: 'AAA Sixth Actor', color: '#b39ddb' }),
					],
				})
			)

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Actors (6)'))
			expect(within(items[rootItem]).getByText('Actors (6)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('AAA First Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 2]).getByText('BBB Second Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 3]).getByText('CCC Third Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 4]).getByText('AAA Fourth Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 5]).getByText('BBB Fifth Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 6]).getByText('AAA Sixth Actor')).toBeInTheDocument()
		})

		it('reverses sorting on sort button click', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					actors: [
						mockActorModel({ name: 'AAA First Actor', color: '#008080' }),
						mockActorModel({ name: 'BBB Second Actor', color: '#008080' }),
						mockActorModel({ name: 'CCC Third Actor', color: '#008080' }),
						mockActorModel({ name: 'AAA Fourth Actor', color: '#b0bec5' }),
						mockActorModel({ name: 'BBB Fifth Actor', color: '#b0bec5' }),
						mockActorModel({ name: 'AAA Sixth Actor', color: '#b39ddb' }),
					],
				})
			)

			await user.click(screen.getAllByTestId('SortIcon')[0])

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Actors (6)'))
			expect(within(items[rootItem]).getByText('Actors (6)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('AAA Sixth Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 2]).getByText('BBB Fifth Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 3]).getByText('AAA Fourth Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 4]).getByText('CCC Third Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 5]).getByText('BBB Second Actor')).toBeInTheDocument()
			expect(within(items[rootItem + 6]).getByText('AAA First Actor')).toBeInTheDocument()
		})

		it('navigates to actor editor on actor click', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					actors: [mockActorModel({ id: 'actor-1111', name: 'Actor name' })],
				})
			)

			await user.click(screen.getByText('Actor name'))

			await waitFor(() => expect(MockedRouter.navigations.length).toEqual(1))
			expect(MockedRouter.navigations[0].target).toEqual('/world/1111/actor/actor-1111')
		})

		it('filters the actors based on the search query on their name', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					actors: [
						mockActorModel({
							name: 'Alice',
							title: 'The Left Cryptographer',
						}),
						mockActorModel({
							name: 'Bob',
							title: 'The Right Cryptographer',
						}),
					],
				})
			)

			await user.type(screen.getByPlaceholderText('Search...'), 'alice')

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Actors (1)'))
			expect(within(items[rootItem]).getByText('Actors (1)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('Alice')).toBeInTheDocument()
		})

		it('filters the actors based on the search query on their title', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					actors: [
						mockActorModel({
							name: 'Alice',
							title: 'The Left Cryptographer',
						}),
						mockActorModel({
							name: 'Bob',
							title: 'The Right Cryptographer',
						}),
					],
				})
			)

			await user.type(screen.getByPlaceholderText('Search...'), 'cryptographer')

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Actors (2)'))
			expect(within(items[rootItem]).getByText('Actors (2)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('Alice')).toBeInTheDocument()
			expect(within(items[rootItem + 2]).getByText('Bob')).toBeInTheDocument()
		})
	})

	describe('events', () => {
		it('renders provided events', () => {
			renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [
						mockEventModel({ name: 'My First Event', timestamp: 1500 }),
						mockEventModel({ name: 'My Second Event', timestamp: 2500 }),
					],
				})
			)

			expect(screen.getByText('My First Event')).toBeInTheDocument()
			expect(screen.getByText('My Second Event')).toBeInTheDocument()
		})

		it('includes the event time correctly', () => {
			renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [
						mockEventModel({ name: 'First Event', timestamp: 1500 }),
						mockEventModel({ name: 'Second Event', timestamp: 2500 }),
						mockEventModel({ name: 'Third Event', timestamp: 3500 }),
					],
				})
			)

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Events (3)'))
			expect(within(items[rootItem + 1]).getByText('Day 2, 01:00')).toBeInTheDocument()
			expect(within(items[rootItem + 2]).getByText('Day 2, 17:40')).toBeInTheDocument()
			expect(within(items[rootItem + 3]).getByText('Day 3, 10:20')).toBeInTheDocument()
		})

		it('sorts provided events based on timestamp', () => {
			renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [
						mockEventModel({ name: 'Second Event', timestamp: 2500 }),
						mockEventModel({ name: 'First Event', timestamp: 1500 }),
						mockEventModel({ name: 'Third Event', timestamp: 3500 }),
					],
				})
			)

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Events (3)'))
			expect(within(items[rootItem]).getByText('Events (3)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('First Event')).toBeInTheDocument()
			expect(within(items[rootItem + 2]).getByText('Second Event')).toBeInTheDocument()
			expect(within(items[rootItem + 3]).getByText('Third Event')).toBeInTheDocument()
		})

		it('reverses sorting on sort button click', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [
						mockEventModel({ name: 'Second Event', timestamp: 2500 }),
						mockEventModel({ name: 'First Event', timestamp: 1500 }),
						mockEventModel({ name: 'Third Event', timestamp: 3500 }),
					],
				})
			)

			await user.click(screen.getAllByTestId('SortIcon')[1])

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Events (3)'))
			expect(within(items[rootItem]).getByText('Events (3)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('Third Event')).toBeInTheDocument()
			expect(within(items[rootItem + 2]).getByText('Second Event')).toBeInTheDocument()
			expect(within(items[rootItem + 3]).getByText('First Event')).toBeInTheDocument()
		})

		it('navigates to outliner on event click', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [mockEventModel({ id: 'event-2222', name: 'First Event', timestamp: 1600 })],
				})
			)

			await user.click(screen.getByText('First Event'))

			await waitFor(() => expect(MockedRouter.navigations.length).toEqual(1))
			expect(MockedRouter.navigations[0].target).toEqual('/world/1111/outliner/1600')
		})

		it('navigates to event editor on double click', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [mockEventModel({ id: 'event-2222', name: 'First Event', timestamp: 1500 })],
				})
			)

			await user.click(screen.getByText('First Event'))
			await user.click(screen.getByText('First Event'))

			expect(MockedRouter.navigations.length).toEqual(1)
			expect(MockedRouter.navigations[0].target).toEqual('/world/1111/editor/event-2222')
		})

		it('filters the events based on the search query', async () => {
			const { user } = renderWithProviders(
				<OverviewPanel />,
				getPreloadedState({
					events: [
						mockEventModel({
							name: 'The Second Event',
							timestamp: 2500,
							issuedStatements: [
								mockStatementModel({
									title: 'The Second Statement',
								}),
							],
						}),
						mockEventModel({
							name: 'The First Event',
							timestamp: 1500,
							issuedStatements: [
								mockStatementModel({
									title: 'The First Statement',
								}),
							],
						}),
					],
				})
			)

			await user.type(screen.getByPlaceholderText('Search...'), 'second event')

			const items = screen.getAllByRole('listitem')

			const rootItem = items.findIndex((item) => item.innerHTML.includes('Events (1)'))
			expect(within(items[rootItem]).getByText('Events (1)')).toBeInTheDocument()
			expect(within(items[rootItem + 1]).getByText('The Second Event')).toBeInTheDocument()
		})
	})
})
