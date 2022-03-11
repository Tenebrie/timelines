import React from 'react'
import styled from 'styled-components'

import { HomePage } from './components/HomePage'
import { GlobalContextProvider } from './context/GlobalContext'

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
			<GlobalContextProvider>
				<Container>
					<HomePage />
				</Container>
			</GlobalContextProvider>
		</div>
	)
}

export default App
