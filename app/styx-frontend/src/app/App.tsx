import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import styled from 'styled-components'

import { LostConnectionAlert } from './features/liveUpdates/components/LostConnectionAlert'
import { useLiveUpdates } from './features/liveUpdates/hooks/useLiveUpdates'
import { ModalsRenderer } from './features/modals/ModalsRenderer'
import { NavigationReceiverWrapper } from './features/navigation/components/NavigationReceiverWrapper'
import { PageMetadata } from './features/pageMetadata/PageMetadata'
import { useSavedPreferences } from './features/preferences/hooks/useSavedPreferences'
import { CustomThemeOverrides } from './features/theming/components/CustomThemeOverrides'
import { CustomThemeProvider } from './features/theming/context/CustomThemeProvider'
import { useShortcutManager } from './hooks/useShortcut/useShortcutManager'

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
						<ModalsRenderer />
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
