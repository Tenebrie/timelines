import { Divider, ListItemText, Menu, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '../../../../hooks/useTimelineBus'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getTimelineContextMenuState, getWorldState } from '../../../../selectors'

export const TimelineContextMenu = () => {
	const { timeToLabel } = useWorldTime()
	const { id: worldId } = useSelector(getWorldState)
	const { isOpen, selectedTime, selectedEvent, mousePos } = useSelector(getTimelineContextMenuState)

	const [updateWorldEvent, { isLoading: isUnrevoking }] = useUpdateWorldEventMutation()

	const { navigateToEventCreator, selectTime } = useWorldRouter()
	const scrollTimelineTo = useTimelineBusDispatch()

	const dispatch = useDispatch()
	const { openRevokedStatementWizard, closeTimelineContextMenu, openDeleteEventModal } = worldSlice.actions

	const onClose = useCallback(
		() => dispatch(closeTimelineContextMenu()),
		[closeTimelineContextMenu, dispatch]
	)

	const onCreateEvent = useCallback(() => {
		onClose()
		navigateToEventCreator({ selectedTime })
		scrollTimelineTo(selectedTime)
	}, [navigateToEventCreator, onClose, scrollTimelineTo, selectedTime])

	const onRevokeEvent = useCallback(() => {
		onClose()
		selectTime(selectedTime)
		dispatch(openRevokedStatementWizard({ preselectedEventId: '' }))
	}, [dispatch, onClose, openRevokedStatementWizard, selectTime, selectedTime])

	const onRevokeSelectedEvent = useCallback(() => {
		if (!selectedEvent) {
			return
		}
		onClose()
		dispatch(openRevokedStatementWizard({ preselectedEventId: selectedEvent.id }))
	}, [dispatch, onClose, openRevokedStatementWizard, selectedEvent])

	const onUnrevokeSelectedEvent = useCallback(async () => {
		if (!selectedEvent) {
			return
		}

		const { error } = parseApiResponse(
			await updateWorldEvent({
				body: {
					revokedAt: null,
				},
				worldId,
				eventId: selectedEvent.id,
			})
		)
		if (error) {
			return
		}
		onClose()
	}, [onClose, selectedEvent, updateWorldEvent, worldId])

	const onDeleteSelectedEvent = useCallback(() => {
		onClose()
		if (!selectedEvent || selectedEvent.markerType === 'bundle') {
			return
		}
		dispatch(openDeleteEventModal(selectedEvent))
	}, [dispatch, onClose, openDeleteEventModal, selectedEvent])

	return (
		<Menu
			open={isOpen}
			onClose={onClose}
			MenuListProps={{ sx: { minWidth: 250 } }}
			anchorReference="anchorPosition"
			anchorPosition={{ top: mousePos.y, left: mousePos.x }}
		>
			{selectedEvent && (
				<MenuItem disabled>
					<ListItemText primary={'Event'} />
				</MenuItem>
			)}
			{selectedEvent && <Divider />}
			{selectedEvent?.markerType === 'issuedAt' && (
				<MenuItem onClick={onRevokeSelectedEvent}>
					<ListItemText primary="Revoke this event" />
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'revokedAt' && (
				<MenuItem onClick={onUnrevokeSelectedEvent} disabled={isUnrevoking}>
					<ListItemText primary="Unrevoke this event" />
				</MenuItem>
			)}
			{selectedEvent && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this event" />
				</MenuItem>
			)}
			{selectedEvent && <Divider />}
			<MenuItem disabled>
				<ListItemText primary={timeToLabel(selectedTime)} />
			</MenuItem>
			<Divider />
			<MenuItem onClick={onCreateEvent}>
				<ListItemText primary="Create event here" />
			</MenuItem>
			<MenuItem onClick={onRevokeEvent}>
				<ListItemText primary="Revoke event here" />
			</MenuItem>
		</Menu>
	)
}
