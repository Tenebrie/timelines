import { Menu, Public } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { BaseNavigator } from '@/app/components/BaseNavigator'
import { preferencesSlice } from '@/app/features/preferences/reducer'
import { getOverviewPreferences } from '@/app/features/preferences/selectors'
import { useWorldRouter } from '@/router/routes/worldRoutes'

export const WorldNavigator = () => {
	const { navigateToCurrentWorldRoot } = useWorldRouter()

	const { panelOpen } = useSelector(getOverviewPreferences)
	const { setPanelOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onToggleOverview = () => {
		dispatch(setPanelOpen(!panelOpen))
	}

	const onNavigate = () => {
		navigateToCurrentWorldRoot()
	}

	return (
		<BaseNavigator>
			<Button onClick={onToggleOverview} aria-label="Toggle">
				<Menu />
			</Button>
			<Button onClick={onNavigate} variant={'contained'} sx={{ gap: 0.5 }}>
				<Public /> World
			</Button>
		</BaseNavigator>
	)
}
