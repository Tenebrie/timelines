import Menu from '@mui/icons-material/Menu'
import Public from '@mui/icons-material/Public'
import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'
import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { BaseNavigator } from '@/app/components/BaseNavigator'
import { preferencesSlice } from '@/app/features/preferences/reducer'
import { getOverviewPreferences } from '@/app/features/preferences/selectors'

import { useEventBusDispatch } from '../../eventBus'
import { getWorldState } from '../selectors'

export const WorldNavigatorComponent = () => {
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
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
			<Button onClick={onNavigate} variant={'contained'} sx={{ gap: 0.5, padding: '8px 15px' }}>
				<Public /> World
			</Button>
		</BaseNavigator>
	)
}

export const WorldNavigator = memo(WorldNavigatorComponent)
