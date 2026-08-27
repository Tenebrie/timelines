import { useTheme } from '@mui/material/styles'
import { useDebugValue, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../preferences/PreferencesSliceSelectors'
import { customDarkTheme, customLightTheme, darkTheme, lightTheme } from '../themes'

export type CustomTheme = ReturnType<typeof useCustomTheme>

export const useCustomTheme = () => {
	useDebugValue('useCustomTheme')
	const theme = useTheme()
	const { reduceAnimations } = useSelector(
		getTimelinePreferences,
		(a, b) => a.reduceAnimations === b.reduceAnimations,
	)

	const customTheme = useMemo(() => {
		const materialTheme =
			theme.palette.mode === 'light' ? lightTheme({ reduceAnimations }) : darkTheme({ reduceAnimations })
		return {
			mode: theme.palette.mode,
			material: materialTheme,
			custom: theme.palette.mode === 'light' ? customLightTheme : customDarkTheme,
			customInverted: theme.palette.mode === 'light' ? customDarkTheme : customLightTheme,
		}
	}, [reduceAnimations, theme.palette.mode])

	return customTheme
}
