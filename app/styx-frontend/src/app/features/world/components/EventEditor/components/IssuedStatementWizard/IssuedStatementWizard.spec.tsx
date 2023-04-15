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

	it('copies entered text into title until a first dot', async () => {
		const { user } = renderWithProviders(<IssuedStatementWizard />, getPreloadedState([]))

		await user.type(screen.getByLabelText('Content'), 'The title will end here. Stuff will continue.')

		expect(screen.getByLabelText('Title')).toHaveValue('The title will end here')
	})

	it('copies entered text into title until a line break', async () => {
		const { user } = renderWithProviders(<IssuedStatementWizard />, getPreloadedState([]))

		await user.type(screen.getByLabelText('Content'), 'The title will end here,\nbut stuff will continue.')

		expect(screen.getByLabelText('Title')).toHaveValue('The title will end here,')
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

		await user.type(screen.getByLabelText('Title'), inputText)

		expect(screen.getByLabelText('Title')).toHaveValue(inputText.substring(0, 256))
	})
})
