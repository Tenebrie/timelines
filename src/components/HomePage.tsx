import { Button } from '@mui/material'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../context/GlobalContext'
import { Sidebar } from './sidebar/Sidebar'
import { Timeline } from './timeline/Timeline'

const HomePageContainer = styled.div`
	display: flex;
	width: 100%;
	max-width: 1600px;
	height: 100%;
	align-items: center;
	justify-content: center;
	gap: 12px;
	flex-direction: column;
`

export const HomePage = () => {
	const globalContext = useContext(GlobalContext)

	return (
		<HomePageContainer>
			<Timeline />
			<Sidebar />
			{globalContext.counter}
			<Button variant="contained" onClick={globalContext.bumpCounter}>
				Bump
			</Button>
		</HomePageContainer>
	)
}
