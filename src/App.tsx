import React from 'react'

import { HomePage } from './components/HomePage'
import { GlobalContextProvider } from './context/GlobalContext'

function App() {
	return (
		<div className="App">
			<GlobalContextProvider>
				<HomePage />
			</GlobalContextProvider>
		</div>
	)
}

export default App
