import { Outlet } from '@tanstack/react-router'
import styled from 'styled-components'

import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'

import { WorldList } from './components/WorldList/WorldList'

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
			<BaseNavigator />
			<WorldListContainer>
				<WorldList />
				<Outlet />
			</WorldListContainer>
		</HomePageContainer>
	)
}
