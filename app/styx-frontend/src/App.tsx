import { Box, ThemeProvider } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { LostConnectionAlert } from './app/features/auth/LostConnectionAlert/LostConnectionAlert'
import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'
import { getUserPreferences } from './app/features/preferences/selectors'
import { useSavedPreferences } from './app/features/preferences/useSavedPreferences'
import { darkTheme, lightTheme } from './app/features/theming/themes'

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100vw;
	min-height: 100vh;
`

const RouterWrapper = () => {
	const { success, target } = useAuthCheck()

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<Container>
			<Outlet />
		</Container>
	)
}

const App = () => {
	useLiveUpdates()
	useSavedPreferences()

	const { colorMode } = useSelector(getUserPreferences)
	const theme = useMemo(() => (colorMode === 'light' ? lightTheme : darkTheme), [colorMode])

	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Box
					sx={{
						color: theme.palette.text.secondary,
						bgcolor: theme.palette.background.paper,
					}}
				>
					<RouterWrapper />
					<LostConnectionAlert server="rhea" />
					<LostConnectionAlert server="calliope" />
				</Box>
			</ThemeProvider>
		</div>
	)
}

export default App
