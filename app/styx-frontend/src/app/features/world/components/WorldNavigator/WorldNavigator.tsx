import { ArrowBack } from '@mui/icons-material'
import { Button } from '@mui/material'
import styled from 'styled-components'

import { SmallProfile } from '../../../auth/smallProfile/SmallProfile'
import { useAppRouter } from '../../router'

const Container = styled.div`
	width: 100%;
	background: #07121e;
	box-shadow: 0 4px 2px -2px #214f81;
	display: flex;
	justify-content: space-between;
`

export const WorldNavigator = () => {
	const { navigateToHome } = useAppRouter()

	const onBack = () => {
		navigateToHome()
	}

	return (
		<Container>
			<Button onClick={onBack}>
				<ArrowBack /> Back
			</Button>
			<SmallProfile />
		</Container>
	)
}
