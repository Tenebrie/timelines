import { ShareWorldApiArg } from '@api/worldCollaboratorsApi'
import { screen, within } from '@testing-library/react'

import {
	mockAddCollaborator,
	mockCollaboratingUser,
	mockGetWorldBrief,
	mockGetWorldCollaborators,
	mockListWorldAccessModes,
	mockRemoveCollaborator,
	mockWorldBriefModel,
} from '@/api/rheaApi.mock'
import { worldInitialState } from '@/app/features/worldTimeline/reducer'
import { renderWithProviders } from '@/jest/renderWithProviders'
import { setupTestServer } from '@/jest/setupTestServer'
import { mockRouter } from '@/router/router.mock'
import { homeRoutes } from '@/router/routes/homeRoutes'

import { ShareWorldModal } from './components/ShareWorldModal'
import { WorldDetails } from './WorldSettings'

const server = setupTestServer()

describe('<WorldSettings />', () => {
	const preloadedState = {
		preloadedState: {
			world: {
				...worldInitialState,
				id: 'world-1111',
			},
		},
	}

	beforeAll(() => {
		mockRouter(homeRoutes.worldDetails, { worldId: 'world-1111' })
	})

	describe('collaborators', () => {
		beforeEach(() => {
			mockListWorldAccessModes(server, {
				response: ['Private', 'PublicEdit', 'PublicRead'],
			})

			mockGetWorldBrief(server, {
				worldId: 'world-1111',
				response: mockWorldBriefModel({
					id: 'world-1111',
				}),
			})

			mockGetWorldCollaborators(server, {
				worldId: 'world-1111',
				response: [],
			})
		})

		it('renders empty state for collaborators by default', async () => {
			renderWithProviders(<WorldDetails />, preloadedState)

			expect(await screen.findByText('No collaborators added')).toBeInTheDocument()
		})

		it("displays collaborator's email", async () => {
			renderWithProviders(<WorldDetails />, preloadedState)

			mockGetWorldBrief(server, {
				worldId: 'world-1111',
				response: mockWorldBriefModel({
					id: 'world-1111',
				}),
			})

			mockGetWorldCollaborators(server, {
				worldId: 'world-1111',
				response: [
					mockCollaboratingUser({
						user: {
							email: 'test@localhost',
						},
					}),
				],
			})

			expect(await screen.findByText('test@localhost')).toBeInTheDocument()
			expect(screen.queryByText('No collaborators added')).not.toBeInTheDocument()
		})

		it('invites a new collaborator', async () => {
			const { user } = renderWithProviders(
				<>
					<WorldDetails />
					<ShareWorldModal />
				</>,
				preloadedState,
			)

			mockGetWorldBrief(server, {
				worldId: 'world-1111',
				response: mockWorldBriefModel({
					id: 'world-1111',
				}),
			})

			const { invocations } = mockAddCollaborator(server, { worldId: 'world-1111', response: null })

			await user.click(await screen.findByText('Share world with specific people...'))
			await user.click(await screen.findByLabelText('Emails'))
			await user.keyboard('user@localhost{enter}')
			await user.click(await screen.findByText('Confirm'))

			expect(invocations.length).toEqual(1)
			expect(invocations[0].jsonBody).toEqual({
				access: 'ReadOnly',
				userEmails: ['user@localhost'],
			} satisfies ShareWorldApiArg['body'])
		})

		it('invites a new collaborator with changed access level', async () => {
			const { user } = renderWithProviders(
				<>
					<WorldDetails />
					<ShareWorldModal />
				</>,
				preloadedState,
			)

			mockGetWorldBrief(server, {
				worldId: 'world-1111',
				response: mockWorldBriefModel({
					id: 'world-1111',
				}),
			})

			const { invocations } = mockAddCollaborator(server, { worldId: 'world-1111', response: null })

			await user.click(await screen.findByText('Share world with specific people...'))
			await user.click(await screen.findByLabelText('Emails'))
			await user.keyboard('user@localhost{enter}')

			await user.click(screen.getByLabelText('Access'))
			await user.click(within(screen.getByRole('listbox')).getByText('Editing'))

			await user.click(await screen.findByText('Confirm'))

			expect(invocations.length).toEqual(1)
			expect(invocations[0].jsonBody).toEqual({
				access: 'Editing',
				userEmails: ['user@localhost'],
			} satisfies ShareWorldApiArg['body'])
		})

		it('removes a collaborator', async () => {
			const { user } = renderWithProviders(<WorldDetails />, preloadedState)

			mockGetWorldBrief(server, {
				worldId: 'world-1111',
				response: mockWorldBriefModel({
					id: 'world-1111',
				}),
			})

			mockGetWorldCollaborators(server, {
				worldId: 'world-1111',
				response: [
					mockCollaboratingUser({
						user: {
							id: 'user-1111',
							email: 'user@localhost',
						},
					}),
				],
			})

			const { hasBeenCalled } = mockRemoveCollaborator(server, {
				worldId: 'world-1111',
				userId: 'user-1111',
				response: null,
			})

			const button = await screen.findByLabelText(
				'Remove user@localhost from collaborators. Requires double click.',
			)
			await user.click(button)
			await user.click(button)

			expect(hasBeenCalled()).toBeTruthy()
		})

		it('cancels removal request', async () => {
			const { user } = renderWithProviders(<WorldDetails />, preloadedState)

			mockGetWorldBrief(server, {
				worldId: 'world-1111',
				response: mockWorldBriefModel({
					id: 'world-1111',
				}),
			})
			mockGetWorldCollaborators(server, {
				worldId: 'world-1111',
				response: [
					mockCollaboratingUser({
						user: {
							id: 'user-1111',
							email: 'user@localhost',
						},
					}),
				],
			})

			const { hasBeenCalled } = mockRemoveCollaborator(server, {
				worldId: 'world-1111',
				userId: 'user-1111',
				response: null,
			})

			const removeCollaboratorButton = await screen.findByLabelText(
				'Remove user@localhost from collaborators. Requires double click.',
			)
			await user.click(removeCollaboratorButton)
			await user.click(await screen.findByLabelText('Cancel removing user@localhost from collaborators.'))
			await user.click(removeCollaboratorButton)

			expect(hasBeenCalled()).toBeFalsy()
		})
	})
})
