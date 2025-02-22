import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import styled from 'styled-components'

import { LostConnectionAlert } from './features/auth/LostConnectionAlert/LostConnectionAlert'
import { useLiveUpdates } from './features/liveUpdates/useLiveUpdates'
import { ModalRenderer } from './features/modals/ModalRenderer'
import { PageMetadata } from './features/pageMetadata/PageMetadata'
import { useSavedPreferences } from './features/preferences/useSavedPreferences'
import { CustomThemeOverrides } from './features/theming/CustomThemeOverrides'
import { CustomThemeProvider } from './features/theming/CustomThemeProvider'
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
