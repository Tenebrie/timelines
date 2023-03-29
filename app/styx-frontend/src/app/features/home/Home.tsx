import React from 'react'
import styled from 'styled-components'

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
			<>You're allowed to the home page!</>
		</HomePageContainer>
	)
}
