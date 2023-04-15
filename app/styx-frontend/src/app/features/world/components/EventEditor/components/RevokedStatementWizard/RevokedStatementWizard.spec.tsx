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
							title: 'Statement 1',
						}),
						mockStatementModel({
							title: 'Statement 2',
						}),
					],
				}),
				mockEventModel({
					id: 'veryold',
					name: 'Very old event',
					timestamp: 0,
					issuedStatements: [
						mockStatementModel({
							title: 'Statement 1',
						}),
						mockStatementModel({
							title: 'Statement 2',
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

		expect(screen.getByText('Very old event / Statement 1')).toBeInTheDocument()
		expect(screen.getByText('Very old event / Statement 2')).toBeInTheDocument()
		expect(screen.getByText('Previous event / Statement 1')).toBeInTheDocument()
		expect(screen.getByText('Previous event / Statement 2')).toBeInTheDocument()
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
						}),
						mockStatementModel({
							id: 'revoked',
							title: 'Statement 2',
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

		expect(screen.getByText('Previous event / Statement 1')).toBeInTheDocument()
		expect(screen.queryByText('Previous event / Statement 2')).not.toBeInTheDocument()
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
						}),
					],
				}),
				mockEventModel({
					id: 'previous',
					name: 'Previous event',
					timestamp: 100,
					issuedStatements: [
						mockStatementModel({
							title: 'Statement 1',
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

		expect(screen.queryByText('Very old event / Statement 1')).not.toBeInTheDocument()
		expect(screen.getByText('Previous event / Statement 1')).toBeInTheDocument()
	})
})
