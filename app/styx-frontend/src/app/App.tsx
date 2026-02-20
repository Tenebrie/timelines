import Box from '@mui/material/Box'
import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import styled from 'styled-components'

import { DragDropPortalSlot } from './features/dragDrop/components/GhostWrapper'
import { EventBusProvider } from './features/eventBus'
import { globalEventBus } from './features/eventBus/eventBus'
import { LostConnectionAlert } from './features/liveUpdates/components/LostConnectionAlert'
import { useLiveUpdates } from './features/liveUpdates/hooks/useLiveUpdates'
import { ModalsRenderer } from './features/modals/ModalsRenderer'
import { BaseNavigator } from './features/navigation/components/BaseNavigator'
import { NavigationReceiverWrapper } from './features/navigation/components/NavigationReceiverWrapper'
import { PageMetadata } from './features/pageMetadata/PageMetadata'
import { useSavedPreferences } from './features/preferences/hooks/useSavedPreferences'
import { CustomThemeOverrides } from './features/theming/components/CustomThemeOverrides'
import { CustomThemeProvider } from './features/theming/context/CustomThemeProvider'
import { useBrowserSpecificScrollbars } from './hooks/useBrowserSpecificScrollbars'
import { useShortcutManager } from './hooks/useShortcut/useShortcutManager'
import { TimelineZoomReporter } from './views/world/views/timeline/components/TimelineZoomReporter'

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100vw;
	min-height: 100vh;
`

const App = () => {
	useLiveUpdates()
	useSavedPreferences()
	useShortcutManager()
	const scrollbars = useBrowserSpecificScrollbars()

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			window.document.title = 'Timelines (Dev)'
		} else if (window.location.hostname === 'staging.tenebrie.com') {
			window.document.title = 'Timelines (Staging)'
		}
	}, [])

	return (
		<div className="App">
			<EventBusProvider bus={globalEventBus}>
				<CustomThemeProvider>
					<CustomThemeOverrides>
						<Container>
							<BaseNavigator />
							<Box
								sx={{
									width: '100%',
									height: 'calc(100vh - 50.5px)',
									overflowY: 'auto',
									...scrollbars,
								}}
							>
								<Outlet />
							</Box>
							<ModalsRenderer />
						</Container>
						<LostConnectionAlert server="rhea" />
						<LostConnectionAlert server="calliope" />
					</CustomThemeOverrides>
				</CustomThemeProvider>
				<NavigationReceiverWrapper />
				<DragDropPortalSlot />
				<PageMetadata />
				<TimelineZoomReporter />
				{/* <SummonableDebug /> */}
			</EventBusProvider>
		</div>
	)
}

export default App
