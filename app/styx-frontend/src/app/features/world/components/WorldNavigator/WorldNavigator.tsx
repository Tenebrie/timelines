import { ArrowBack } from '@mui/icons-material'
import { Button } from '@mui/material'
import styled from 'styled-components'

import { useAppRouter } from '../../router'

const Container = styled.div`
	width: 100%;
	min-height: 32px;
	background: #07121e;
	box-shadow: 0 4px 2px -2px #214f81;
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
		</Container>
	)
}
