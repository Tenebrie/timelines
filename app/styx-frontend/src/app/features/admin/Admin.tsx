import styled from 'styled-components'

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
	return (
		<AdminPageContainer>
			<AdminNavigator />
			<AdminUserList />
		</AdminPageContainer>
	)
}
