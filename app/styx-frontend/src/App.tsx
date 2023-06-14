import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { LostConnectionAlert } from './app/features/auth/LostConnectionAlert/LostConnectionAlert'
import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'
import { useSavedPreferences } from './app/features/preferences/useSavedPreferences'

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100vw;
	height: 100vh;
`

function App() {
	useAuthCheck()
	useLiveUpdates()
	useSavedPreferences()

	return (
		<div className="App">
			<Container>
				<Outlet />
			</Container>
			<LostConnectionAlert server="rhea" />
			<LostConnectionAlert server="calliope" />
		</div>
	)
}

export default App
