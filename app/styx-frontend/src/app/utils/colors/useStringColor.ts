import { useCallback, useMemo } from 'react'

import { useCustomTheme } from '../../features/theming/hooks/useCustomTheme'
import { hashCode } from '../hashCode'

export const useStringColor = (value: string) => {
	const resolver = useStringColorResolver()
	return useMemo(() => resolver(value), [value, resolver])
}

export const useStringColorResolver = () => {
	const theme = useCustomTheme()
	return useCallback(
		(value: string) => {
			const hash = Math.abs(hashCode(value))
			const hue = (hash % 20) * 18
			const lightness = theme.mode === 'dark' ? '65%' : '35%'
			return `hsl(${hue},80%,${lightness})`
		},
		[theme.mode],
	)
}
