import { CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { QueryParams } from '../../../../../../../router/routes/QueryParams'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '../../../../hooks/useTimelineBus'
import { worldSlice } from '../../../../reducer'
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

	const { navigateTo, selectTime, selectedTimeOrZero: selectedWorldTime } = useWorldRouter()

	const scrollTimelineTo = useTimelineBusDispatch()

	const { revokeEventAt, unrevokeEventAt, isRequestInFlight } = useTimelineContextMenuRequests()

	const dispatch = useDispatch()
	const {
		openRevokedStatementWizard,
		closeTimelineContextMenu,
		openDeleteEventModal,
		openDeleteEventDeltaModal,
	} = worldSlice.actions

	const onClose = useCallback(
		() => dispatch(closeTimelineContextMenu()),
		[closeTimelineContextMenu, dispatch]
	)

	const onCreateEvent = useCallback(() => {
		onClose()
		navigateTo({
			target: worldRoutes.eventCreator,
			args: {
				worldId,
			},
			query: {
				[QueryParams.SELECTED_TIME]: String(selectedTime),
			},
		})
		scrollTimelineTo(selectedTime)
	}, [navigateTo, onClose, scrollTimelineTo, selectedTime, worldId])

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
		navigateTo({
			target: worldRoutes.eventDeltaCreator,
			args: {
				worldId,
				eventId: selectedEvent.id,
			},
		})
	}, [navigateTo, onClose, selectedEvent, worldId])

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

		if (selectedEvent.markerType === 'deltaState') {
			const deltaState = selectedEvent.deltaStates.find((state) => state.id === selectedEvent.id)
			if (!deltaState) {
				return
			}

			dispatch(openDeleteEventDeltaModal(deltaState))
			return
		}

		dispatch(openDeleteEventModal(selectedEvent))
	}, [dispatch, onClose, openDeleteEventDeltaModal, openDeleteEventModal, selectedEvent])

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
					<ListItemText primary={selectedEvent.markerType === 'deltaState' ? 'Event state' : 'Event'} />
				</MenuItem>
			)}
			{selectedEvent && <Divider />}
			{selectedEvent && (
				<MenuItem onClick={onReplaceSelectedEvent} disabled={isRequestInFlight}>
					<ListItemText primary="Create event state" />
				</MenuItem>
			)}
			{(selectedEvent?.markerType === 'issuedAt' || selectedEvent?.markerType === 'deltaState') && (
				<MenuItem onClick={onRevokeSelectedEvent} disabled={isRequestInFlight}>
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
					)}
					<ListItemText primary="Retire this event" />
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'revokedAt' && (
				<MenuItem onClick={onUnrevokeSelectedEvent} disabled={isRequestInFlight}>
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={24} />
						</ListItemIcon>
					)}
					<ListItemText primary="Unretire this event" />
				</MenuItem>
			)}
			{(selectedEvent?.markerType === 'issuedAt' || selectedEvent?.markerType === 'revokedAt') && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this event" />
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'deltaState' && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this state" />
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
				<ListItemText primary="Retire event here" />
			</MenuItem>
		</Menu>
	)
}
