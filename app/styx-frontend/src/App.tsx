import { Theme } from '@emotion/react'
import { Box, SxProps, ThemeProvider } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { LostConnectionAlert } from './app/features/auth/LostConnectionAlert/LostConnectionAlert'
import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'
import { ModalRenderer } from './app/features/modals/ModalRenderer'
import { getUserPreferences } from './app/features/preferences/selectors'
import { useSavedPreferences } from './app/features/preferences/useSavedPreferences'
import { darkTheme, lightTheme } from './app/features/theming/themes'
import { useBrowserSpecificScrollbars } from './hooks/useBrowserSpecificScrollbars'

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100vw;
	min-height: 100vh;
`

const App = () => {
	useLiveUpdates()
	useSavedPreferences()
	useAuthCheck()
	const scrollbarThemes = useBrowserSpecificScrollbars()

	const { colorMode } = useSelector(getUserPreferences)
	const theme = useMemo(() => (colorMode === 'light' ? lightTheme : darkTheme), [colorMode])

	const themeOverrides: SxProps<Theme> = {
		...scrollbarThemes,
		color: theme.palette.text.secondary,
		bgcolor: theme.palette.background.default,
		'* .MuiTabs-indicator': {
			borderRadius: 1,
			backgroundColor: theme.palette.primary.main,
		},
		transition: 'background 0.3s',
	}

	useEffect(() => {
		window.document.title = 'Timelines (Dev)'
	}, [])

	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Box sx={themeOverrides}>
					<Container>
						<Outlet />
						<ModalRenderer />
					</Container>
					<LostConnectionAlert server="rhea" />
					<LostConnectionAlert server="calliope" />
				</Box>
			</ThemeProvider>
		</div>
	)
}

export default App
