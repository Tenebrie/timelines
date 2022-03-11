import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import styled from 'styled-components'

function App() {
	const [test, setTest] = useState<number>(0)

	const onClick = () => {
		setTest(test + 1)
	}

	const MyButton = styled.button`
		border-radius: 16px;
	`

	return (
		<div className="App">
			{test}
			<MyButton onClick={onClick}>Bump test</MyButton>
		</div>
	)
}

export default App
