import Menu from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'
import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { BaseNavigator } from '@/app/features/navigation/components/BaseNavigator'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getOverviewPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const WorldNavigator = memo(WorldNavigatorComponent)

export function WorldNavigatorComponent() {
	const scrollTimelineTo = useEventBusDispatch({ event: 'timeline/requestScrollTo' })
	const navigate = useNavigate({ from: '/world/$worldId' })

	const { timeOrigin } = useSelector(getWorldState, (a, b) => a.timeOrigin === b.timeOrigin)
	const { panelOpen } = useSelector(getOverviewPreferences)
	const { setPanelOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onToggleOverview = useCallback(() => {
		dispatch(setPanelOpen(!panelOpen))
	}, [dispatch, panelOpen, setPanelOpen])

	const onNavigate = useCallback(() => {
		navigate({ to: '/world/$worldId/timeline', search: (prev) => ({ ...prev, time: timeOrigin }) })
		scrollTimelineTo({ timestamp: timeOrigin })
	}, [navigate, scrollTimelineTo, timeOrigin])

	return (
		<BaseNavigator>
			<Button onClick={onToggleOverview} aria-label="Toggle">
				<Menu />
			</Button>
		</BaseNavigator>
	)
}
