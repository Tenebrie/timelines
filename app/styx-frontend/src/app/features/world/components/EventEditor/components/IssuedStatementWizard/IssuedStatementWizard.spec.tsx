import { screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../../../../jest/renderWithProviders'
import { initialState } from '../../../../reducer'
import { worldRoutes } from '../../../../router'
import { mockRouter } from '../../../../router.mock'
import { WorldEvent } from '../../../../types'
import { IssuedStatementWizard } from './IssuedStatementWizard'

describe('<IssuedStatementWizard />', () => {
	const getPreloadedState = (events: WorldEvent[]) => ({
		preloadedState: {
			world: {
				...initialState,
				eventEditor: {
					...initialState.eventEditor,
					issuedStatementWizard: {
						isOpen: true,
						mode: 'create' as const,
						scope: 'world' as const,
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

	it('allows unlimited characters in content field', async () => {
		const { user } = renderWithProviders(<IssuedStatementWizard />, getPreloadedState([]))

		const inputText = Array(30)
			.fill('ThisIsText')
			.reduce((total, current) => total + current, '')

		await user.type(screen.getByLabelText('Content'), inputText)

		expect(screen.getByLabelText('Content')).toHaveValue(inputText)
	})

	it('limits characters in title field', async () => {
		const { user } = renderWithProviders(<IssuedStatementWizard />, getPreloadedState([]))

		const inputText = Array(30)
			.fill('ThisIsText')
			.reduce((total, current) => total + current, '')

		await user.type(screen.getByLabelText('Title (optional)'), inputText)

		expect(screen.getByLabelText('Title (optional)')).toHaveValue(inputText.substring(0, 256))
	})
})
