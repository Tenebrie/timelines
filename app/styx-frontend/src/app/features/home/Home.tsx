import React from 'react'
import styled from 'styled-components'

import { WorldList } from '../worldList/WorldList'

const HomePageContainer = styled.div`
	display: flex;
	width: 25%;
	height: 25%;
	align-items: center;
	justify-content: center;
	gap: 64px;
	flex-direction: column;
`

export const Home = () => {
	return (
		<HomePageContainer>
			<WorldList />
		</HomePageContainer>
	)
}
