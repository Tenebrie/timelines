import { Home, Menu } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { BaseNavigator } from '../../../../components/BaseNavigator'
import { preferencesSlice } from '../../../preferences/reducer'
import { getOverviewPreferences } from '../../../preferences/selectors'
import { useAppRouter } from '../../router'

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
		<BaseNavigator>
			<Button onClick={onToggleOverview}>
				<Menu />
			</Button>
			<Button onClick={onBack}>
				<Home /> Home
			</Button>
		</BaseNavigator>
	)
}
