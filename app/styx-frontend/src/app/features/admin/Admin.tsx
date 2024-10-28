import { Navigate } from 'react-router-dom'
import styled from 'styled-components'

import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { AdminNavigator } from './components/navigator/AdminNavigator'
import { AdminUserList } from './components/users/AdminUserList'

const AdminPageContainer = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	align-items: center;
`

export const Admin = () => {
	const { success, target } = useAuthCheck()

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<AdminPageContainer>
			<AdminNavigator />
			<AdminUserList />
		</AdminPageContainer>
	)
}
