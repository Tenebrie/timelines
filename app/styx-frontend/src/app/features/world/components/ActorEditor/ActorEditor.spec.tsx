import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockActorModel, mockUpdateActor } from '@/api/rheaApi.mock'
import { renderWithProviders } from '@/jest/renderWithProviders'
import { mockRouter } from '@/router/router.mock'

import { worldInitialState } from '../../reducer'
import { ActorEditor } from './ActorEditor'

const server = setupServer()

describe('ActorEditor', () => {
	beforeAll(() => {
		server.listen()

		mockRouter('/world/:worldId/actor/:actorId', {
			worldId: 'world-1111',
			actorId: 'actor-1111',
		})
	})
	afterEach(() => server.resetHandlers())
	afterAll(() => {
		server.close()
	})

	it('populates the fields with actor data', () => {
		renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
							name: 'Actor name',
							title: 'Actor title',
							color: '#008080',
							description: 'This is the actor description',
						}),
					],
				},
			},
		})

		expect(screen.getByDisplayValue('Actor name')).toBeInTheDocument()
		expect(screen.getByDisplayValue('Actor title')).toBeInTheDocument()
		expect(screen.getByDisplayValue('#008080')).toBeInTheDocument()
		expect(screen.getByDisplayValue('This is the actor description')).toBeInTheDocument()
	})

	it('renders empty state if no events are provided', () => {
		renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
						}),
					],
				},
			},
		})

		expect(screen.getByText('No events to show!')).toBeInTheDocument()
	})

	// it('does not render empty state if events and statements are provided', () => {
	// 	const actor = mockActorModel({
	// 		id: 'actor-1111',
	// 	})
	// 	renderWithProviders(<ActorEditor />, {
	// 		preloadedState: {
	// 			world: {
	// 				...worldInitialState,
	// 				events: [
	// 					mockEventModel({
	// 						id: 'event-1111',
	// 						name: 'Event name',
	// 						issuedStatements: [
	// 							mockStatementModel({
	// 								content: 'Statement content',
	// 								targetActors: [actor],
	// 							}),
	// 						],
	// 					}),
	// 				],
	// 				actors: [actor],
	// 			},
	// 		},
	// 	})

	// 	expect(screen.queryByText('No events to show!')).not.toBeInTheDocument()
	// })

	// it('renders statement (where actor is target) if provided', () => {
	// 	const actor = mockActorModel({
	// 		id: 'actor-1111',
	// 	})
	// 	renderWithProviders(<ActorEditor />, {
	// 		preloadedState: {
	// 			world: {
	// 				...worldInitialState,
	// 				events: [
	// 					mockEventModel({
	// 						id: 'event-1111',
	// 						name: 'Event name',
	// 						issuedStatements: [
	// 							mockStatementModel({
	// 								content: 'Statement content',
	// 								targetActors: [actor],
	// 							}),
	// 						],
	// 					}),
	// 				],
	// 				actors: [actor],
	// 			},
	// 		},
	// 	})

	// 	expect(screen.getByText('Event name')).toBeInTheDocument()
	// 	expect(screen.getByText('Statement content')).toBeInTheDocument()
	// })

	// it('renders statement (where actor is mentioned) if provided', () => {
	// 	const actor = mockActorModel({
	// 		id: 'actor-1111',
	// 	})
	// 	renderWithProviders(<ActorEditor />, {
	// 		preloadedState: {
	// 			world: {
	// 				...worldInitialState,
	// 				events: [
	// 					mockEventModel({
	// 						id: 'event-1111',
	// 						name: 'Event name',
	// 						issuedStatements: [
	// 							mockStatementModel({
	// 								content: 'Statement content',
	// 								mentionedActors: [actor],
	// 							}),
	// 						],
	// 					}),
	// 				],
	// 				actors: [actor],
	// 			},
	// 		},
	// 	})

	// 	expect(screen.getByText('Event name')).toBeInTheDocument()
	// 	expect(screen.getByText('Statement content')).toBeInTheDocument()
	// })

	// it('does not render statements where actor is not related', () => {
	// 	renderWithProviders(<ActorEditor />, {
	// 		preloadedState: {
	// 			world: {
	// 				...worldInitialState,
	// 				events: [
	// 					mockEventModel({
	// 						id: 'event-1111',
	// 						name: 'Event name',
	// 						issuedStatements: [
	// 							mockStatementModel({
	// 								content: 'Statement content',
	// 								targetActors: [
	// 									mockActorModel({
	// 										id: 'actor-2222',
	// 									}),
	// 								],
	// 							}),
	// 						],
	// 					}),
	// 				],
	// 				actors: [
	// 					mockActorModel({
	// 						id: 'actor-1111',
	// 					}),
	// 				],
	// 			},
	// 		},
	// 	})

	// 	expect(screen.getByText('No events to show!')).toBeInTheDocument()
	// 	expect(screen.queryByText('Event name')).not.toBeInTheDocument()
	// 	expect(screen.queryByText('Statement content')).not.toBeInTheDocument()
	// })

	it('sends a save request on save click', async () => {
		const { user } = renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
							name: 'Actor name',
							title: 'Actor title',
							color: '#008080',
							description: 'This is the actor description',
						}),
					],
				},
			},
		})

		const mock = mockUpdateActor(server, {
			worldId: 'world-1111',
			actorId: 'actor-1111',
			response: mockActorModel(),
		})

		await user.click(screen.getByText('Save'))

		expect(mock.hasBeenCalled()).toBeTruthy()
		expect(mock.invocations[0].jsonBody).toEqual({
			name: 'Actor name',
			title: 'Actor title',
			color: '#008080',
			description: 'This is the actor description',
		})
	})

	it('autosaves the data after name field is updated', async () => {
		const { user } = renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
							name: 'Actor name',
							title: 'Actor title',
							color: '#008080',
							description: 'This is the actor description',
						}),
					],
				},
			},
		})

		const mock = mockUpdateActor(server, {
			worldId: 'world-1111',
			actorId: 'actor-1111',
			response: mockActorModel(),
		})

		const actorNameInput = screen.getByDisplayValue('Actor name')
		await user.clear(actorNameInput)
		await user.type(actorNameInput, 'Updated name')

		await waitFor(() => expect(mock.hasBeenCalled()).toBeTruthy(), { timeout: 3000 })
		expect(mock.invocations[0].jsonBody).toEqual({
			name: 'Updated name',
			title: 'Actor title',
			color: '#008080',
			description: 'This is the actor description',
		})
	})

	it('autosaves the data after title field is updated', async () => {
		const { user } = renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
							name: 'Actor name',
							title: 'Actor title',
							color: '#008080',
							description: 'This is the actor description',
						}),
					],
				},
			},
		})

		const actorTitleInput = screen.getByDisplayValue('Actor title')
		await user.clear(actorTitleInput)
		await user.type(actorTitleInput, 'Updated title')

		const mock = mockUpdateActor(server, {
			worldId: 'world-1111',
			actorId: 'actor-1111',
			response: mockActorModel(),
		})

		await waitFor(() => expect(mock.hasBeenCalled()).toBeTruthy(), { timeout: 3000 })
		expect(mock.invocations[0].jsonBody).toEqual({
			name: 'Actor name',
			title: 'Updated title',
			color: '#008080',
			description: 'This is the actor description',
		})
	})

	it('autosaves the data after color field is updated', async () => {
		const { user } = renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
							name: 'Actor name',
							title: 'Actor title',
							color: '#008080',
							description: 'This is the actor description',
						}),
					],
				},
			},
		})

		await user.click(screen.getByLabelText('Color'))
		await user.click(screen.getByText('Pink'))

		const mock = mockUpdateActor(server, {
			worldId: 'world-1111',
			actorId: 'actor-1111',
			response: mockActorModel(),
		})

		await waitFor(() => expect(mock.hasBeenCalled()).toBeTruthy(), { timeout: 3000 })
		expect(mock.invocations[0].jsonBody).toEqual({
			name: 'Actor name',
			title: 'Actor title',
			color: '#f48fb1',
			description: 'This is the actor description',
		})
	})

	it('autosaves the data after description field is updated', async () => {
		const { user } = renderWithProviders(<ActorEditor />, {
			preloadedState: {
				world: {
					...worldInitialState,
					actors: [
						mockActorModel({
							id: 'actor-1111',
							name: 'Actor name',
							title: 'Actor title',
							color: '#008080',
							description: 'This is the actor description',
						}),
					],
				},
			},
		})

		const actorDescriptionInput = screen.getByDisplayValue('This is the actor description')
		await user.clear(actorDescriptionInput)
		await user.type(actorDescriptionInput, 'New description')

		const mock = mockUpdateActor(server, {
			worldId: 'world-1111',
			actorId: 'actor-1111',
			response: mockActorModel(),
		})

		await waitFor(() => expect(mock.hasBeenCalled()).toBeTruthy(), { timeout: 3000 })
		expect(mock.invocations[0].jsonBody).toEqual({
			name: 'Actor name',
			title: 'Actor title',
			color: '#008080',
			description: 'New description',
		})
	})
})
