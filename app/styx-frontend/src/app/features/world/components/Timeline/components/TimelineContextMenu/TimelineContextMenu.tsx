import { Divider, ListItemText, Menu, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '../../../../hooks/useTimelineBus'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { useTimelineContextMenu } from './useTimelineContextMenu'

type Props = {
	state: ReturnType<typeof useTimelineContextMenu>['state']
}

export const TimelineContextMenu = ({ state }: Props) => {
	const { timeToLabel } = useWorldTime()

	const { navigateToEventCreator, selectTime } = useWorldRouter()
	const scrollTimelineTo = useTimelineBusDispatch()

	const dispatch = useDispatch()
	const { openRevokedStatementWizard } = worldSlice.actions

	const onCreateEvent = useCallback(() => {
		state.onClose()
		navigateToEventCreator({ selectedTime: state.selectedTime })
		scrollTimelineTo(state.selectedTime)
	}, [navigateToEventCreator, scrollTimelineTo, state])

	const onRevokeEvent = useCallback(() => {
		state.onClose()
		selectTime(state.selectedTime)
		dispatch(openRevokedStatementWizard())
	}, [dispatch, openRevokedStatementWizard, selectTime, state])

	return (
		<Menu
			open={state.open}
			onClose={state.onClose}
			MenuListProps={{ sx: { minWidth: 250 } }}
			anchorReference="anchorPosition"
			anchorPosition={{ top: state.mousePos.y, left: state.mousePos.x }}
		>
			<MenuItem disabled>
				<ListItemText primary={timeToLabel(state.selectedTime)} />
			</MenuItem>
			<Divider />
			<MenuItem onClick={onCreateEvent}>
				<ListItemText primary="Create event" />
			</MenuItem>
			<MenuItem onClick={onRevokeEvent}>
				<ListItemText primary="Revoke event" />
			</MenuItem>
		</Menu>
	)
}
