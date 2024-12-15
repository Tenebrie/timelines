import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { LostConnectionAlert } from './app/features/auth/LostConnectionAlert/LostConnectionAlert'
import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'
import { ModalRenderer } from './app/features/modals/ModalRenderer'
import { PageMetadata } from './app/features/pageMetadata/PageMetadata'
import { useSavedPreferences } from './app/features/preferences/useSavedPreferences'
import { CustomThemeOverrides } from './app/features/theming/CustomThemeOverrides'
import { CustomThemeProvider } from './app/features/theming/CustomThemeProvider'
import { NavigationReceiverWrapper } from './hooks/NavigationReceiverWrapper'
import { useShortcutManager } from './hooks/useShortcutManager'

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
	useShortcutManager()

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			window.document.title = 'Timelines (Dev)'
		} else if (window.location.hostname === 'staging.tenebrie.com') {
			window.document.title = 'Timelines (Staging)'
		}
	}, [])

	return (
		<div className="App">
			<CustomThemeProvider>
				<CustomThemeOverrides>
					<Container>
						<Outlet />
						<ModalRenderer />
					</Container>
					<LostConnectionAlert server="rhea" />
					<LostConnectionAlert server="calliope" />
				</CustomThemeOverrides>
			</CustomThemeProvider>
			<NavigationReceiverWrapper />
			<PageMetadata />
		</div>
	)
}

export default App
