import Menu from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Summonable } from '@/app/features/navigation/components/NavigatorPortal'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getOverviewPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

export const WorldNavigator = memo(WorldNavigatorComponent)

export function WorldNavigatorComponent() {
	const { panelOpen } = useSelector(getOverviewPreferences)
	const { setPanelOpen } = preferencesSlice.actions
	const dispatch = useDispatch()

	const onToggleOverview = useCallback(() => {
		dispatch(setPanelOpen(!panelOpen))
	}, [dispatch, panelOpen, setPanelOpen])

	return (
		<Summonable>
			<Button onClick={onToggleOverview} aria-label="Toggle" sx={{ height: '100%' }}>
				<Menu />
			</Button>
		</Summonable>
	)
}
