import { screen } from '@testing-library/react'

import { mockEventModel, mockStatementModel } from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { initialState } from '../../reducer'
import { worldRoutes } from '../../router'
import { mockRouter } from '../../router.mock'
import { WorldDetails, WorldStatement } from '../../types'
import { Outliner } from './Outliner'

describe('<Outliner />', () => {
	const getPreloadedState = (statements: WorldStatement[], worldOptions: Partial<WorldDetails> = {}) => ({
		preloadedState: {
			world: {
				...initialState,
				isLoaded: true,
				events:
					statements.length > 0
						? [
								mockEventModel({
									timestamp: 0,
									issuedStatements: statements,
								}),
						  ]
						: [],
				...worldOptions,
			},
		},
	})

	beforeAll(() => {
		mockRouter(worldRoutes.outliner, {
			worldId: '1111',
			timestamp: '10000',
		})
	})

	it('renders the provided event statements', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([
				mockStatementModel({ content: 'First statement text' }),
				mockStatementModel({ content: 'Second statement text' }),
			])
		)

		expect(screen.getByText('First statement text')).toBeInTheDocument()
		expect(screen.getByText('Second statement text')).toBeInTheDocument()
	})

	it('does not render empty state if events are present', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([
				mockStatementModel({ content: 'First statement text' }),
				mockStatementModel({ content: 'Second statement text' }),
			])
		)

		expect(screen.queryByText('It seems that nothing has happened yet!')).not.toBeInTheDocument()
	})

	it('does not render a statement happening in the future', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				events: [
					mockEventModel({
						timestamp: 1000000,
						issuedStatements: [mockStatementModel({ content: 'First statement text' })],
					}),
				],
			})
		)

		expect(screen.queryByText('First statement text')).not.toBeInTheDocument()
	})

	it('renders an empty state in an empty project', () => {
		renderWithProviders(<Outliner />, getPreloadedState([]))

		expect(screen.getByText('It seems that nothing has happened yet!')).toBeInTheDocument()
	})

	it('renders the label for countup calendar world', async () => {
		renderWithProviders(<Outliner />, getPreloadedState([mockStatementModel()], { calendar: 'COUNTUP' }))

		expect(screen.getByText('Day 7, 22:40')).toBeInTheDocument()
	})

	it('renders the label for earth calendar world', async () => {
		renderWithProviders(<Outliner />, getPreloadedState([], { calendar: 'EARTH' }))

		expect(screen.getByText('2023, January 7, 22:40')).toBeInTheDocument()
	})

	it('renders the label for pf2e calendar world', async () => {
		renderWithProviders(<Outliner />, getPreloadedState([], { calendar: 'PF2E' }))

		expect(screen.getByText('4723, Abadius 7, 22:40')).toBeInTheDocument()
	})

	it('renders the label for rimworld calendar world', async () => {
		renderWithProviders(<Outliner />, getPreloadedState([], { calendar: 'RIMWORLD' }))

		expect(screen.getByText('5500, Aprimay 7, 22:40')).toBeInTheDocument()
	})
})
