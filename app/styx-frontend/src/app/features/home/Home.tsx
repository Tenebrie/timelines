import { Navigate } from 'react-router-dom'
import styled from 'styled-components'

import { BaseNavigator } from '../../components/BaseNavigator'
import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { WorldList } from '../worldList/WorldList'

const HomePageContainer = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	align-items: center;
`

const WorldListContainer = styled.div`
	display: flex;
	flex-grow: 1;
	align-items: center;
	justify-content: center;
	gap: 64px;
	flex-direction: column;
`

export const Home = () => {
	const { success, target } = useAuthCheck()

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<HomePageContainer>
			<BaseNavigator />
			<WorldListContainer>
				<WorldList />
			</WorldListContainer>
		</HomePageContainer>
	)
}
