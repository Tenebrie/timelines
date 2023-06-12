import { screen, waitFor } from '@testing-library/react'

import { mockActorModel, mockEventModel, mockStatementModel } from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { initialState } from '../../reducer'
import { worldRoutes } from '../../router'
import { MockedRouter, mockRouter, resetMockRouter } from '../../router.mock'
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

	afterEach(() => {
		resetMockRouter()
	})

	it('renders the provided actors', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				actors: [
					mockActorModel({
						name: 'First Actor',
						title: 'First Actor Title',
					}),
					mockActorModel({
						name: 'Other Actor',
						title: 'Other Actor Title',
					}),
				],
			})
		)

		expect(screen.getByText('FA')).toBeInTheDocument()
		expect(screen.getByText('First Actor')).toBeInTheDocument()
		expect(screen.getByText('First Actor Title')).toBeInTheDocument()
		expect(screen.getByText('OA')).toBeInTheDocument()
		expect(screen.getByText('Other Actor')).toBeInTheDocument()
		expect(screen.getByText('Other Actor Title')).toBeInTheDocument()
	})

	it('does not render the provided empty events by default', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				events: [
					mockEventModel({
						name: 'First event name',
					}),
					mockEventModel({
						name: 'Other event name',
					}),
				],
			})
		)

		expect(screen.queryByText('First event name')).not.toBeInTheDocument()
		expect(screen.queryByText('Other event name')).not.toBeInTheDocument()
	})

	it('renders the provided empty events after enabling the setting', async () => {
		const { user } = renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				events: [
					mockEventModel({
						name: 'First event name',
					}),
					mockEventModel({
						name: 'Other event name',
					}),
				],
			})
		)

		await user.click(screen.getByText('Filters'))
		await user.click(screen.getByText('Show empty events'))

		expect(screen.getByText('First event name')).toBeInTheDocument()
		expect(screen.getByText('Other event name')).toBeInTheDocument()
	})

	it('renders the provided event statements', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([
				mockStatementModel({ content: 'First statement text' }),
				mockStatementModel({ content: 'Second statement text' }),
			])
		)

		expect(screen.getByText('Event name')).toBeInTheDocument()
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

	it('does not render empty state if actors are present', () => {
		renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				actors: [mockActorModel()],
			})
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

	it('hides statement information if actor is collapsed', async () => {
		const statement = mockStatementModel({
			content: 'Statement content',
			targetActors: [
				mockActorModel({
					name: 'Target actor name',
				}),
			],
			mentionedActors: [
				mockActorModel({
					name: 'Mentioned actor name',
				}),
			],
		})

		const { user } = renderWithProviders(
			<Outliner />,
			getPreloadedState([statement], {
				actors: [
					mockActorModel({
						id: 'actor-1111',
						name: 'Actor name',
						statements: [statement],
					}),
				],
			})
		)

		expect(screen.getAllByText('Statement content').length).toEqual(2)
		expect(screen.getAllByText('Target actor name').length).toEqual(2)
		expect(screen.getAllByText('Mentioned actor name').length).toEqual(2)

		await user.click(screen.getByText('Actor name'))

		await waitFor(() => expect(screen.getAllByText('Statement content').length).toEqual(1))
		expect(screen.getAllByText('Target actor name').length).toEqual(1)
		expect(screen.getAllByText('Mentioned actor name').length).toEqual(1)

		await user.click(screen.getByText('Actor name'))

		await waitFor(() => expect(screen.getAllByText('Statement content').length).toEqual(2))
		expect(screen.getAllByText('Target actor name').length).toEqual(2)
		expect(screen.getAllByText('Mentioned actor name').length).toEqual(2)
	})

	it('hides statement information if event is collapsed', async () => {
		const targetActor = mockActorModel({
			id: 'actor-1111',
			name: 'Target actor name',
		})
		const mentionedActor = mockActorModel({
			id: 'actor-2222',
			name: 'Mentioned actor name',
		})

		const { user } = renderWithProviders(
			<Outliner />,
			getPreloadedState([
				mockStatementModel({
					content: 'Is related to',
					targetActors: [targetActor],
					mentionedActors: [mentionedActor],
				}),
			])
		)

		expect(screen.getByText('Is related to')).toBeInTheDocument()
		expect(screen.getByText('Target actor name')).toBeInTheDocument()
		expect(screen.getByText('Mentioned actor name')).toBeInTheDocument()

		await user.click(screen.getByText('Event name'))

		await waitFor(() => expect(screen.queryByText('Is related to')).not.toBeInTheDocument())
		expect(screen.queryByText('Target actor name')).not.toBeInTheDocument()
		expect(screen.queryByText('Mentioned actor name')).not.toBeInTheDocument()

		await user.click(screen.getByText('Event name'))

		await screen.findByText('Is related to')
		expect(screen.getByText('Target actor name')).toBeInTheDocument()
		expect(screen.getByText('Mentioned actor name')).toBeInTheDocument()
	})

	it('navigates to actor editor when edit button is clicked', async () => {
		const targetActor = mockActorModel({
			id: 'actor-1111',
			name: 'Target actor name',
		})
		const mentionedActor = mockActorModel({
			id: 'actor-2222',
			name: 'Mentioned actor name',
		})

		const { user } = renderWithProviders(
			<Outliner />,
			getPreloadedState(
				[
					mockStatementModel({
						targetActors: [targetActor],
						mentionedActors: [mentionedActor],
					}),
				],
				{
					actors: [targetActor, mentionedActor],
				}
			)
		)

		await user.click(screen.getAllByTestId('EditIcon')[0])

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/world/1111/actor/actor-1111')
	})

	it('navigates to event editor when edit button is clicked', async () => {
		const { user } = renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				events: [mockEventModel({ id: 'event-1111', issuedStatements: [mockStatementModel()] })],
			})
		)

		await user.click(screen.getAllByTestId('EditIcon')[0])

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/world/1111/editor/event-1111')
	})

	it('navigates to statement editor when statement is clicked', async () => {
		const { user } = renderWithProviders(
			<Outliner />,
			getPreloadedState([], {
				events: [
					mockEventModel({
						id: 'event-1111',
						issuedStatements: [mockStatementModel({ id: 'statement-1111', content: 'Statement content' })],
					}),
				],
			})
		)

		await user.click(screen.getByText('Statement content'))

		expect(MockedRouter.navigations.length).toEqual(1)
		expect(MockedRouter.navigations[0].target).toEqual('/world/1111/statement/statement-1111')
	})
})
