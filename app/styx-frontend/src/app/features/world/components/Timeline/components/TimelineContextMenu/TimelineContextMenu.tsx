import { CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '../../../../hooks/useTimelineBus'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { getTimelineContextMenuState, getWorldState } from '../../../../selectors'
import { useTimelineContextMenuRequests } from './hooks/useTimelineContextMenuRequests'

export const TimelineContextMenu = () => {
	const { timeToLabel } = useWorldTime()
	const { id: worldId } = useSelector(getWorldState)
	const {
		isOpen,
		selectedTime,
		selectedEvent: selectedEventOrBundle,
		mousePos,
	} = useSelector(getTimelineContextMenuState)

	const selectedEvent = selectedEventOrBundle?.markerType !== 'bundle' ? selectedEventOrBundle : null

	const {
		navigateToEventCreator,
		navigateToEventDeltaCreator,
		selectTime,
		selectedTime: selectedWorldTime,
	} = useWorldRouter()
	const scrollTimelineTo = useTimelineBusDispatch()

	const { revokeEventAt, unrevokeEventAt, isRequestInFlight } = useTimelineContextMenuRequests()

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

	const onReplaceSelectedEvent = useCallback(() => {
		onClose()
		if (!selectedEvent) {
			return
		}
		navigateToEventDeltaCreator({ eventId: selectedEvent.id })
	}, [navigateToEventDeltaCreator, onClose, selectedEvent])

	const onRevokeSelectedEvent = useCallback(async () => {
		if (!selectedEvent) {
			return
		}

		await revokeEventAt({
			worldId,
			eventId: selectedEvent.id,
			revokedAt: selectedWorldTime,
		})

		onClose()
	}, [onClose, revokeEventAt, selectedEvent, selectedWorldTime, worldId])

	const onUnrevokeSelectedEvent = useCallback(async () => {
		if (!selectedEvent) {
			return
		}

		await unrevokeEventAt({
			worldId,
			eventId: selectedEvent.id,
		})

		onClose()
	}, [onClose, selectedEvent, unrevokeEventAt, worldId])

	const onDeleteSelectedEvent = useCallback(() => {
		onClose()
		if (!selectedEvent) {
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
			{selectedEvent && (
				<MenuItem onClick={onReplaceSelectedEvent} disabled={isRequestInFlight}>
					<ListItemText primary="Replace this event" />
				</MenuItem>
			)}
			{(selectedEvent?.markerType === 'issuedAt' || selectedEvent?.markerType === 'replaceAt') && (
				<MenuItem onClick={onRevokeSelectedEvent} disabled={isRequestInFlight}>
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
					)}
					<ListItemText primary="Revoke this event" />
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'revokedAt' && (
				<MenuItem onClick={onUnrevokeSelectedEvent} disabled={isRequestInFlight}>
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
					)}
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
