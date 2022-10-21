import React from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100vw;
	height: 100vh;
`

function App() {
	return (
		<div className="App">
			<Container>
				<Outlet />
			</Container>
		</div>
	)
}

export default App
