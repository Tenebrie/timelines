import { screen } from '@testing-library/react'

import { mockEventModel, mockStatementModel } from '../../../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../../../jest/renderWithProviders'
import { initialState } from '../../../../reducer'
import { worldRoutes } from '../../../../router'
import { mockRouter } from '../../../../router.mock'
import { WorldEvent } from '../../../../types'
import { RevokedStatementWizard } from './RevokedStatementWizard'

describe('<RevokedStatementWizard />', () => {
	const getPreloadedState = (events: WorldEvent[]) => ({
		preloadedState: {
			world: {
				...initialState,
				eventEditor: {
					...initialState.eventEditor,
					revokedStatementWizard: {
						isOpen: true,
					},
				},
				events,
			},
		},
	})

	beforeEach(() => {
		mockRouter(worldRoutes.eventEditor, {
			worldId: '1111',
			eventId: 'current',
		})
	})

	it('renders the list of revokable statements', async () => {
		const { user } = renderWithProviders(
			<RevokedStatementWizard />,
			getPreloadedState([
				mockEventModel({
					id: 'previous',
					name: 'Previous event',
					timestamp: 100,
					issuedStatements: [
						mockStatementModel({
							title: 'Statement 3 Title',
							content: 'Statement 3 Content',
						}),
					],
				}),
				mockEventModel({
					id: 'veryold',
					name: 'Very old event',
					timestamp: 0,
					issuedStatements: [
						mockStatementModel({
							title: 'Statement 1 Title',
							content: 'Statement 1 Content',
						}),
						mockStatementModel({
							title: 'Statement 2 Title',
							content: 'Statement 2 Content',
						}),
					],
				}),
				mockEventModel({
					id: 'current',
					timestamp: 1000,
				}),
			])
		)

		await user.click(screen.getByLabelText('Statement to revoke'))

		const options = screen.getAllByRole('option').map((a) => a.textContent)
		expect(options[0]).toContain('Statement 1 Title: Statement 1 Content')
		expect(options[1]).toContain('Statement 2 Title: Statement 2 Content')
		expect(options[2]).toContain('Statement 3 Title: Statement 3 Content')
	})

	it('renders placeholder if no statements are available', async () => {
		renderWithProviders(
			<RevokedStatementWizard />,
			getPreloadedState([
				mockEventModel({
					id: 'current',
				}),
			])
		)

		expect(screen.getByLabelText('Statement to revoke')).toBeDisabled()
		expect(screen.getByDisplayValue('No statements available!')).toBeInTheDocument()
	})

	it('does not list statements revoked by the current event', async () => {
		const { user } = renderWithProviders(
			<RevokedStatementWizard />,
			getPreloadedState([
				mockEventModel({
					id: 'previous',
					name: 'Previous event',
					timestamp: 100,
					issuedStatements: [
						mockStatementModel({
							title: 'Statement 1',
							content: 'Statement 1 Content',
						}),
						mockStatementModel({
							id: 'revoked',
							title: 'Statement 2',
							content: 'Statement 2 Content',
						}),
					],
				}),
				mockEventModel({
					id: 'current',
					timestamp: 1000,
					revokedStatements: [
						mockStatementModel({
							id: 'revoked',
						}),
					],
				}),
			])
		)

		await user.click(screen.getByLabelText('Statement to revoke'))

		expect(screen.queryByText('Statement 2 Content')).not.toBeInTheDocument()
	})

	it('does not list statements revoked by the previous event', async () => {
		const { user } = renderWithProviders(
			<RevokedStatementWizard />,
			getPreloadedState([
				mockEventModel({
					id: 'veryold',
					name: 'Very old event',
					timestamp: 0,
					issuedStatements: [
						mockStatementModel({
							id: 'revoked',
							title: 'Statement 1',
							content: 'Statement 1 Content',
						}),
					],
				}),
				mockEventModel({
					id: 'previous',
					name: 'Previous event',
					timestamp: 100,
					issuedStatements: [
						mockStatementModel({
							title: 'Statement 2',
							content: 'Statement 2 Content',
						}),
					],
					revokedStatements: [
						mockStatementModel({
							id: 'revoked',
						}),
					],
				}),
				mockEventModel({
					id: 'current',
					timestamp: 1000,
				}),
			])
		)

		await user.click(screen.getByLabelText('Statement to revoke'))

		expect(screen.queryByText('Statement 1 Content')).not.toBeInTheDocument()
	})
})
