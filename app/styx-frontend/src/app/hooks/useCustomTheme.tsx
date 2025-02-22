import { useTheme } from '@mui/material'
import { useDebugValue, useMemo } from 'react'

import { customDarkTheme, customLightTheme, darkTheme, lightTheme } from '../features/theming/themes'

export type CustomTheme = ReturnType<typeof useCustomTheme>

export const useCustomTheme = () => {
	useDebugValue('useCustomTheme')
	const theme = useTheme()

	const customTheme = useMemo(() => {
		const materialTheme = theme.palette.mode === 'light' ? lightTheme : darkTheme
		return {
			mode: theme.palette.mode,
			material: materialTheme,
			custom: theme.palette.mode === 'light' ? customLightTheme : customDarkTheme,
			customInverted: theme.palette.mode === 'light' ? customDarkTheme : customLightTheme,
		}
	}, [theme])

	return customTheme
}
