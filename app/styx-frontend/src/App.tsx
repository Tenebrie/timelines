import { Box, ThemeProvider } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { LostConnectionAlert } from './app/features/auth/LostConnectionAlert/LostConnectionAlert'
import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'
import { getUserPreferences } from './app/features/preferences/selectors'
import { useSavedPreferences } from './app/features/preferences/useSavedPreferences'
import { darkTheme, lightTheme } from './app/features/theming/themes'

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100vw;
	height: 100vh;
`

function App() {
	useLiveUpdates()
	useSavedPreferences()

	const { colorMode } = useSelector(getUserPreferences)
	const theme = useMemo(() => (colorMode === 'light' ? lightTheme : darkTheme), [colorMode])

	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Box sx={{ color: theme.palette.text.secondary, bgcolor: theme.palette.background.paper }}>
					<Container>
						<Outlet />
					</Container>
					<LostConnectionAlert server="rhea" />
					<LostConnectionAlert server="calliope" />
				</Box>
			</ThemeProvider>
		</div>
	)
}

export default App
