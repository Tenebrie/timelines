import './App.css'

import Button from '@mui/material/Button'
import React, { useState } from 'react'

function App() {
	const [test, setTest] = useState<number>(0)

	const onClick = () => {
		setTest(test + 1)
	}

	return (
		<div className="App">
			<span>Learn React</span>
			{test}
			<Button variant="contained" onClick={onClick}>
				Bump test
			</Button>
		</div>
	)
}

export default App
