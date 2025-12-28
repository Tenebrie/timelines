import { SxProps, Theme } from '@mui/material/styles'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getUserPreferences } from '../features/preferences/PreferencesSliceSelectors'

export const useBrowserSpecificScrollbars = () => {
	const { colorMode } = useSelector(getUserPreferences, (a, b) => a.colorMode === b.colorMode)

	return useMemo(() => {
		const isChrome = navigator.userAgent.includes('Chrome')

		const lightScrollbarColor = 'rgba(0, 0, 0, 0.3)'
		const darkScrollbarColor = 'rgba(255, 255, 255, 0.3)'
		const lightScrollbarHoverColor = 'rgba(0, 0, 0, 0.35)'
		const darkScrollbarHoverColor = 'rgba(255, 255, 255, 0.35)'
		const lightScrollbarActiveColor = 'rgba(0, 0, 0, 0.4)'
		const darkScrollbarActiveColor = 'rgba(255, 255, 255, 0.4)'
		const lightScrollbarTrackColor = 'rgba(0, 0, 0, 0.1)'
		const darkScrollbarTrackColor = 'rgba(255, 255, 255, 0.1)'

		const standardTheme: SxProps<Theme> = {
			'&': {
				scrollbarWidth: 'thin',
				scrollbarColor:
					colorMode === 'dark'
						? `${darkScrollbarColor} ${darkScrollbarTrackColor}`
						: `${lightScrollbarColor} ${lightScrollbarTrackColor}`,
			},
			'&:hover': {
				scrollbarColor:
					colorMode === 'dark'
						? `${darkScrollbarHoverColor} ${darkScrollbarTrackColor}`
						: `${lightScrollbarHoverColor} ${lightScrollbarTrackColor}`,
			},
			'&:active': {
				scrollbarColor:
					colorMode === 'dark'
						? `${darkScrollbarActiveColor} ${darkScrollbarTrackColor}`
						: `${lightScrollbarActiveColor} ${lightScrollbarTrackColor}`,
			},
		}

		const chromeTheme: SxProps<Theme> = {
			'::-webkit-scrollbar': {
				width: '8px',
			},
			'::-webkit-scrollbar-track': {
				borderRadius: '4px',
				background: colorMode === 'dark' ? darkScrollbarTrackColor : lightScrollbarTrackColor,
			},
			'::-webkit-scrollbar-thumb': {
				borderRadius: '4px',
				background: colorMode === 'dark' ? darkScrollbarColor : lightScrollbarColor,
			},

			'::-webkit-scrollbar-thumb:hover': {
				background: colorMode === 'dark' ? darkScrollbarHoverColor : lightScrollbarHoverColor,
			},
			'::-webkit-scrollbar-thumb:active': {
				background: colorMode === 'dark' ? darkScrollbarActiveColor : lightScrollbarActiveColor,
			},
		}

		return isChrome ? chromeTheme : standardTheme
	}, [colorMode])
}
