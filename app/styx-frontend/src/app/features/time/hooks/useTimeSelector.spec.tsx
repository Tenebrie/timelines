import { renderHookWithProviders } from '@/test-utils/renderWithProviders'

import { worldInitialState } from '../../world/reducer'
import { useTimeSelector } from './useTimeSelector'

describe('useTimeSelector', () => {
	const { result: hook } = renderHookWithProviders(() => useTimeSelector({ rawTime: 5000 }), {
		preloadedState: {
			world: {
				...worldInitialState,
				selectedTime: 5000,
			},
		},
	})

	it('should return the current time for empty string', () => {
		expect(hook.current.applySelector('')).toEqual({ timestamp: 5000 })
	})

	it('should apply relative time', () => {
		expect(hook.current.applySelector('3d 15m')).toEqual({ timestamp: 9335 })
	})

	it('should apply absolute time', () => {
		expect(hook.current.applySelector('2021-01-01 12:00')).toEqual({ timestamp: -300584880 })
	})
})
