import { screen, within } from '@testing-library/react'

import { mockEventModel, mockStatementModel } from '../../../../../api/rheaApi.mock'
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

	afterEach(() => {
		resetMockRouter()
	})

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

		expect(within(items[1]).getByText('Day 1, 01:00')).toBeInTheDocument()
		expect(within(items[2]).getByText('Day 1, 17:40')).toBeInTheDocument()
		expect(within(items[3]).getByText('Day 2, 10:20')).toBeInTheDocument()
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

		expect(within(items[0]).getByText('Events')).toBeInTheDocument()
		expect(within(items[1]).getByText('First Event')).toBeInTheDocument()
		expect(within(items[2]).getByText('Second Event')).toBeInTheDocument()
		expect(within(items[3]).getByText('Third Event')).toBeInTheDocument()
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

		await user.click(screen.getAllByTestId('SortIcon')[0])

		const items = screen.getAllByRole('listitem')

		expect(within(items[0]).getByText('Events')).toBeInTheDocument()
		expect(within(items[1]).getByText('Third Event')).toBeInTheDocument()
		expect(within(items[2]).getByText('Second Event')).toBeInTheDocument()
		expect(within(items[3]).getByText('First Event')).toBeInTheDocument()
	})

	it('navigates to event editor on click', async () => {
		const { user } = renderWithProviders(
			<OverviewPanel />,
			getPreloadedState({
				events: [mockEventModel({ id: 'event-2222', name: 'First Event', timestamp: 1500 })],
			})
		)

		await user.click(screen.getByText('First Event'))

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/world/1111/editor/event-2222')
	})

	it('renders provided statements', () => {
		renderWithProviders(
			<OverviewPanel />,
			getPreloadedState({
				events: [
					mockEventModel({
						issuedStatements: [
							mockStatementModel({
								title: 'The First Statement',
							}),
							mockStatementModel({
								title: 'The Second Statement',
							}),
						],
					}),
				],
			})
		)

		expect(screen.getByText('The First Statement')).toBeInTheDocument()
		expect(screen.getByText('The Second Statement')).toBeInTheDocument()
	})

	it('includes the statement secondary text correctly', () => {
		renderWithProviders(
			<OverviewPanel />,
			getPreloadedState({
				events: [
					mockEventModel({
						id: 'event-2222',
						timestamp: 1500,
						issuedStatements: [
							mockStatementModel({
								issuedByEventId: 'event-2222',
								title: 'The First Statement',
							}),
						],
					}),
				],
			})
		)

		const items = screen.getAllByRole('listitem')

		expect(within(items[3]).getByText('Event name @ Day 1, 01:00')).toBeInTheDocument()
	})

	it("sorts the provided events according to parent event's timestamps", () => {
		renderWithProviders(
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

		const items = screen.getAllByRole('listitem')

		expect(within(items[3]).getByText('Statements')).toBeInTheDocument()
		expect(within(items[4]).getByText('The First Statement')).toBeInTheDocument()
		expect(within(items[5]).getByText('The Second Statement')).toBeInTheDocument()
	})

	it('reverts statement sorting', async () => {
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

		await user.click(screen.getAllByTestId('SortIcon')[1])

		const items = screen.getAllByRole('listitem')

		expect(within(items[3]).getByText('Statements')).toBeInTheDocument()
		expect(within(items[4]).getByText('The Second Statement')).toBeInTheDocument()
		expect(within(items[5]).getByText('The First Statement')).toBeInTheDocument()
	})

	it('navigates to statement editor on click', async () => {
		const { user } = renderWithProviders(
			<OverviewPanel />,
			getPreloadedState({
				events: [
					mockEventModel({
						issuedStatements: [
							mockStatementModel({
								id: 'statement-3333',
								title: 'The Second Statement',
							}),
						],
					}),
				],
			})
		)

		await user.click(screen.getByText('The Second Statement'))

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/world/1111/statement/statement-3333')
	})
})
