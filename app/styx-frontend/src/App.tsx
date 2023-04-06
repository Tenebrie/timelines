import React from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useLiveUpdates } from './app/features/liveUpdates/useLiveUpdates'

const Container = styled.div`
	display: flex;
	justify-content: center;
	width: 100vw;
	height: 100vh;
`

function App() {
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
