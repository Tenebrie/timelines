import React from 'react'
import styled from 'styled-components'

import { World } from '../world/World'

const HomePageContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;
	gap: 64px;
	flex-direction: column;
`

export const Home = () => {
	return (
		<HomePageContainer>
			<World />
		</HomePageContainer>
	)
}
