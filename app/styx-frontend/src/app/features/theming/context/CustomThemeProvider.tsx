import { ThemeProvider } from '@mui/material/styles'
import { JSX, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences, getUserPreferences } from '../../preferences/PreferencesSliceSelectors'
import { darkTheme, lightTheme } from '../themes'

type Props = {
	children: JSX.Element | (JSX.Element | null)[] | null
	colorMode?: 'light' | 'dark'
}

export const CustomThemeProvider = ({ children, colorMode }: Props) => {
	return (
		<>
			{colorMode ? (
				<ManualThemeProvider colorMode={colorMode}>{children}</ManualThemeProvider>
			) : (
				<AutomaticThemeProvider>{children}</AutomaticThemeProvider>
			)}
		</>
	)
}

const AutomaticThemeProvider = ({ children }: Props) => {
	const { colorMode } = useSelector(getUserPreferences, (a, b) => a.colorMode === b.colorMode)
	const { reduceAnimations } = useSelector(
		getTimelinePreferences,
		(a, b) => a.reduceAnimations === b.reduceAnimations,
	)
	const theme = useMemo(
		() => (colorMode === 'light' ? lightTheme({ reduceAnimations }) : darkTheme({ reduceAnimations })),
		[colorMode, reduceAnimations],
	)

	return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const ManualThemeProvider = ({ children, colorMode }: Props) => {
	const { reduceAnimations } = useSelector(
		getTimelinePreferences,
		(a, b) => a.reduceAnimations === b.reduceAnimations,
	)
	const theme = useMemo(
		() => (colorMode === 'light' ? lightTheme({ reduceAnimations }) : darkTheme({ reduceAnimations })),
		[colorMode, reduceAnimations],
	)

	return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
