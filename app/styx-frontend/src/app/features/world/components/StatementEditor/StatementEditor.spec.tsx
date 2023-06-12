import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { setupServer } from 'msw/lib/node'

import {
	mockDeleteWorldStatement,
	mockEventModel,
	mockStatementModel,
	mockUpdateWorldStatement,
} from '../../../../../api/rheaApi.mock'
import { renderWithProviders } from '../../../../../jest/renderWithProviders'
import { initialState } from '../../reducer'
import { worldRoutes } from '../../router'
import { mockRouter } from '../../router.mock'
import { WorldStatement } from '../../types'
import { StatementEditor } from './StatementEditor'

const server = setupServer()

describe('<StatementEditor />', () => {
	beforeAll(() => server.listen())
	afterEach(() => server.resetHandlers())
	afterAll(() => server.close())

	const getPreloadedState = (statement: WorldStatement) => ({
		preloadedState: {
			world: {
				...initialState,
				events: [
					mockEventModel({
						id: 'issuing-event',
						name: 'Issuing Event',
						description: 'Issuing Event Description',
						issuedStatements: [statement],
					}),
					mockEventModel({
						id: 'revoking-event',
						name: 'Revoking Event',
						description: 'Revoking Event Description',
					}),
				],
			},
		},
	})

	beforeAll(() => {
		mockRouter(worldRoutes.statementEditor, {
			worldId: '1111',
			statementId: '2222',
		})
	})

	it('renders the statement data', () => {
		renderWithProviders(
			<StatementEditor />,
			getPreloadedState(
				mockStatementModel({
					id: '2222',
					title: 'Statement title',
					content: 'Amazing statement text',
					issuedByEventId: 'issuing-event',
					revokedByEventId: 'revoking-event',
				})
			)
		)

		expect(screen.getByDisplayValue('Statement title')).toBeInTheDocument()
		expect(screen.getByDisplayValue('Amazing statement text')).toBeInTheDocument()
		expect(screen.getByText('Issued by')).toBeInTheDocument()
		expect(screen.getByText('Issuing Event')).toBeInTheDocument()
		expect(screen.getByText('Issuing Event Description')).toBeInTheDocument()
		expect(screen.getByText('Revoked by')).toBeInTheDocument()
		expect(screen.getByText('Revoking Event')).toBeInTheDocument()
		expect(screen.getByText('Revoking Event Description')).toBeInTheDocument()
	})

	it('does not render revoking event section if not revoked', () => {
		renderWithProviders(
			<StatementEditor />,
			getPreloadedState(
				mockStatementModel({
					id: '2222',
					title: 'Statement title',
					content: 'Amazing statement text',
					issuedByEventId: 'issuing-event',
				})
			)
		)

		expect(screen.queryByText('Revoked by')).not.toBeInTheDocument()
		expect(screen.queryByText('Revoking Event')).not.toBeInTheDocument()
		expect(screen.queryByText('Revoking Event Description')).not.toBeInTheDocument()
	})

	it('sends a save request on save button click', async () => {
		const { user } = renderWithProviders(
			<StatementEditor />,
			getPreloadedState(
				mockStatementModel({
					id: '2222',
					title: 'Statement title',
					content: 'Amazing statement text',
					issuedByEventId: 'issuing-event',
				})
			)
		)

		const { hasBeenCalled, invocations } = mockUpdateWorldStatement(server, {
			worldId: '1111',
			statementId: '2222',
			response: mockStatementModel({
				id: '2222',
				title: 'New title',
				content: 'New description',
			}),
		})

		await user.clear(screen.getByLabelText('Title (optional)'))
		await user.type(screen.getByLabelText('Title (optional)'), 'New title')
		await user.clear(screen.getByLabelText('Content'))
		await user.type(screen.getByLabelText('Content'), 'New description')
		await user.click(screen.getByText('Save'))

		await waitFor(() => expect(hasBeenCalled).toBeTruthy())
		expect(invocations[0].jsonBody).toEqual({
			title: 'New title',
			content: 'New description',
			targetActorIds: [],
			mentionedActorIds: [],
		})
	})

	it('deletes the statement', async () => {
		const { user } = renderWithProviders(
			<StatementEditor />,
			getPreloadedState(
				mockStatementModel({
					id: '2222',
					title: 'Statement title',
					content: 'Amazing statement text',
					issuedByEventId: 'issuing-event',
				})
			)
		)

		const { hasBeenCalled } = mockDeleteWorldStatement(server, {
			worldId: '1111',
			statementId: '2222',
			response: mockStatementModel({
				id: '2222',
				title: 'New title',
				content: 'New description',
			}),
		})

		await user.click(screen.getByText('Delete'))
		await user.click(screen.getByText('Confirm'))

		expect(screen.getByText('Delete Statement')).toBeInTheDocument()
		await waitForElementToBeRemoved(() => screen.queryByText('Delete Statement'))
		expect(hasBeenCalled).toBeTruthy()
	})
})
