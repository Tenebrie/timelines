import { useTheme } from '@mui/material'
import { useMemo } from 'react'

import { customDarkTheme, customLightTheme, darkTheme, lightTheme } from '../app/features/theming/themes'

export type CustomTheme = ReturnType<typeof useCustomTheme>

export const useCustomTheme = () => {
	const theme = useTheme()

	const customTheme = useMemo(() => {
		const materialTheme = theme.palette.mode === 'light' ? lightTheme : darkTheme
		return {
			mode: theme.palette.mode,
			material: materialTheme,
			custom: theme.palette.mode === 'light' ? customLightTheme : customDarkTheme,
		}
	}, [theme])

	return customTheme
}
