import { renderHookWithProviders } from '@/jest/renderWithProviders'

import { useEntityName } from './useEntityName'

describe('useEntityName', () => {
	const getDefaultProps = (): Parameters<typeof useEntityName>[0] => ({
		textSource: '',
		entityClassName: 'testEntity',
		timestamp: 0,
		customName: '',
		customNameEnabled: false,
		onChange: () => {
			// empty
		},
	})

	it('cuts off entity name on a full stop', () => {
		const { result } = renderHookWithProviders(() =>
			useEntityName({
				...getDefaultProps(),
				textSource: 'This is a text. It has full stops.',
			}),
		)

		expect(result.current.name).toEqual('This is a text')
	})

	it('cuts off entity name on a line break', () => {
		const { result } = renderHookWithProviders(() =>
			useEntityName({
				...getDefaultProps(),
				textSource: 'This is a text\nIt has a line break.',
			}),
		)

		expect(result.current.name).toEqual('This is a text')
	})
})
