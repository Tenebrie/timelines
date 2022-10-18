import React from 'react'
import styled from 'styled-components'

import { Home } from './app/features/home/Home'

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
				<Home />
			</Container>
		</div>
	)
}

export default App
