import { Outlet } from '@tanstack/react-router'
import styled from 'styled-components'

import { WorldList } from '../worldList/WorldList'
import { HomeNavigator } from './components/navigator/HomeNavigator'

const HomePageContainer = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	align-items: center;
`

const WorldListContainer = styled.div`
	display: flex;
	flex-direction: row;
	flex-grow: 1;
	align-items: center;
	justify-content: center;
	gap: 64px;
`

export const Home = () => {
	return (
		<HomePageContainer>
			<HomeNavigator />
			<WorldListContainer>
				<WorldList />
				<Outlet />
			</WorldListContainer>
		</HomePageContainer>
	)
}
