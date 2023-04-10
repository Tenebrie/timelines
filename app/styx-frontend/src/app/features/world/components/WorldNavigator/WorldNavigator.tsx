import { Home, Menu } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { SmallProfile } from '../../../auth/smallProfile/SmallProfile'
import { preferencesSlice } from '../../../preferences/reducer'
import { getOverviewPreferences } from '../../../preferences/selectors'
import { useAppRouter } from '../../router'

const Container = styled.div`
	width: 100%;
	background: #07121e;
	box-shadow: 0 4px 2px -2px #214f81;
	display: flex;
	justify-content: space-between;
	z-index: 2;
`

export const WorldNavigator = () => {
	const { navigateToHome } = useAppRouter()

	const { panelOpen } = useSelector(getOverviewPreferences)
	const { setPanelOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onToggleOverview = () => {
		dispatch(setPanelOpen(!panelOpen))
	}

	const onBack = () => {
		navigateToHome()
	}

	return (
		<Container>
			<div>
				<Button onClick={onToggleOverview}>
					<Menu />
				</Button>
				<Button onClick={onBack}>
					<Home /> Home
				</Button>
			</div>
			<SmallProfile />
		</Container>
	)
}
