import Menu from '@mui/icons-material/Menu'
import Public from '@mui/icons-material/Public'
import Button from '@mui/material/Button'
import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { BaseNavigator } from '@/app/components/BaseNavigator'
import { preferencesSlice } from '@/app/features/preferences/reducer'
import { getOverviewPreferences } from '@/app/features/preferences/selectors'
import { useWorldTimelineRouter } from '@/router/routes/worldTimelineRoutes'

import { useTimelineBusDispatch } from '../../worldTimeline/hooks/useTimelineBus'
import { worldSlice } from '../../worldTimeline/reducer'

export const WorldNavigatorComponent = () => {
	const { navigateToOutliner } = useWorldTimelineRouter()
	const scrollTimelineTo = useTimelineBusDispatch()

	const { panelOpen } = useSelector(getOverviewPreferences)
	const { setSelectedTime } = worldSlice.actions
	const { setPanelOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onToggleOverview = useCallback(() => {
		dispatch(setPanelOpen(!panelOpen))
	}, [dispatch, panelOpen, setPanelOpen])

	const onNavigate = useCallback(() => {
		navigateToOutliner()
		dispatch(setSelectedTime(0))
		scrollTimelineTo(0)
	}, [dispatch, navigateToOutliner, scrollTimelineTo, setSelectedTime])

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

export const WorldNavigator = memo(WorldNavigatorComponent)
