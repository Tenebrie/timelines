import { screen, within } from '@testing-library/react'

import { ShareWorldApiArg } from '../../../../../api/rheaApi'
import {
	mockAddCollaborator,
	mockApiWorldDetailsModel,
	mockCollaboratingUser,
	mockGetWorldCollaborators,
	mockGetWorldDetails,
	mockRemoveCollaborator,
} from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { setupTestServer } from '../../../../../jest/setupTestServer'
import { mockRouter } from '../../../../../router/router.mock'
import { homeRoutes } from '../../../../../router/routes/homeRoutes'
import { ShareWorldModal } from './components/ShareWorldModal'
import { WorldDetails } from './WorldDetails'

const server = setupTestServer()

describe('<WorldDetails />', () => {
	beforeAll(() => {
		mockRouter(homeRoutes.worldDetails, { worldId: 'world-1111' })
	})

	describe('collaborators', () => {
		beforeEach(() => {
			mockGetWorldDetails(server, {
				worldId: 'world-1111',
				response: mockApiWorldDetailsModel({
					id: 'world-1111',
				}),
			})

			mockGetWorldCollaborators(server, {
				worldId: 'world-1111',
				response: [],
			})
		})

		it('renders empty state for collaborators by default', async () => {
			renderWithProviders(<WorldDetails />)

			expect(await screen.findByText('No collaborators added')).toBeInTheDocument()
		})

		it("displays collaborator's email", async () => {
			renderWithProviders(<WorldDetails />)

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
				</>
			)

			const { invocations } = mockAddCollaborator(server, { worldId: 'world-1111', response: null })

			await user.click(await screen.findByText('Share world...'))
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
				</>
			)

			const { invocations } = mockAddCollaborator(server, { worldId: 'world-1111', response: null })

			await user.click(await screen.findByText('Share world...'))
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
			const { user } = renderWithProviders(<WorldDetails />)

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
				'Remove user@localhost from collaborators. Requires double click.'
			)
			await user.click(button)
			await user.click(button)

			expect(hasBeenCalled()).toBeTruthy()
		})

		it('cancels removal request', async () => {
			const { user } = renderWithProviders(<WorldDetails />)

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
				'Remove user@localhost from collaborators. Requires double click.'
			)
			await user.click(removeCollaboratorButton)
			await user.click(await screen.findByLabelText('Cancel removing user@localhost from collaborators.'))
			await user.click(removeCollaboratorButton)

			expect(hasBeenCalled()).toBeFalsy()
		})
	})
})
