import React from 'react'
import styled from 'styled-components'

import { Timeline } from '../world/components/Timeline/Timeline'
import { Sidebar } from './components/sidebar/Sidebar'

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

export const Home = () => {
	return (
		<HomePageContainer>
			<Timeline />
			<Sidebar />
		</HomePageContainer>
	)
}
