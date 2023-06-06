import React from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAuthCheck } from './app/features/auth/authCheck/useAuthCheck'
import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100vw;
	height: 100vh;
`

function App() {
	useAuthCheck()
	useLiveUpdates()

	return (
		<div className="App">
			<Container>
				<Outlet />
			</Container>
		</div>
	)
}

export default App
