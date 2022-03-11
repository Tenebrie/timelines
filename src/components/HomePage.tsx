import { Button } from '@mui/material'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../context/GlobalContext'

const HomePageContainer = styled.div`
	display: flex;
	width: 100vw;
	height: 100vh;
	align-items: center;
	justify-content: center;
	gap: 12px;
`

export const HomePage = () => {
	const globalContext = useContext(GlobalContext)

	return (
		<HomePageContainer>
			{globalContext.counter}
			<Button variant="contained" onClick={globalContext.bumpCounter}>
				Bump
			</Button>
		</HomePageContainer>
	)
}
