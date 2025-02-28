import styled from 'styled-components'

import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'

import { Admin } from './Admin'

const AdminPageContainer = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	align-items: center;
`

export const AdminView = () => {
	return (
		<AdminPageContainer>
			<BaseNavigator />
			<Admin />
		</AdminPageContainer>
	)
}
