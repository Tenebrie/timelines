import { CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useModal } from '../../../../../modals/reducer'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { worldSlice } from '../../../../reducer'
import { getTimelineContextMenuState, getWorldState } from '../../../../selectors'
import { useTimelineContextMenuRequests } from './hooks/useTimelineContextMenuRequests'

export const TimelineContextMenuComponent = () => {
	const { timeToLabel } = useWorldTime()
	const { id: worldId } = useSelector(getWorldState)
	const { isOpen, selectedTime, selectedEvent, mousePos } = useSelector(getTimelineContextMenuState)

	const {
		navigateToOutliner,
		navigateToEventCreator,
		navigateToEventDeltaCreator,
		selectTime,
		selectedTimeOrZero: selectedWorldTime,
	} = useWorldRouter()

	const { revokeEventAt, unrevokeEventAt, isRequestInFlight } = useTimelineContextMenuRequests()

	const dispatch = useDispatch()
	const { closeTimelineContextMenu } = worldSlice.actions
	const { open: openRevokedStatementWizard } = useModal('revokedStatementWizard')
	const { open: openDeleteEventModal } = useModal('deleteEventModal')
	const { open: openDeleteEventDeltaModal } = useModal('deleteEventDeltaModal')

	const onClose = useCallback(
		() => dispatch(closeTimelineContextMenu()),
		[closeTimelineContextMenu, dispatch],
	)

	const onCreateEvent = useCallback(() => {
		onClose()
		navigateToEventCreator(selectedTime)
	}, [navigateToEventCreator, onClose, selectedTime])

	const onRevokeEvent = useCallback(() => {
		onClose()
		selectTime(selectedTime)
		openRevokedStatementWizard({ preselectedEventId: '' })
		navigateToOutliner(selectedTime)
	}, [navigateToOutliner, onClose, openRevokedStatementWizard, selectTime, selectedTime])

	const onReplaceSelectedEvent = useCallback(() => {
		onClose()
		if (!selectedEvent) {
			return
		}
		navigateToEventDeltaCreator({
			eventId: selectedEvent.id,
			selectedTime: selectedWorldTime,
		})
	}, [navigateToEventDeltaCreator, onClose, selectedEvent, selectedWorldTime])

	const onRevokeSelectedEvent = useCallback(async () => {
		if (!selectedEvent) {
			return
		}

		await revokeEventAt({
			worldId,
			eventId: selectedEvent.eventId,
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
			eventId: selectedEvent.eventId,
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

			openDeleteEventDeltaModal({ target: deltaState })
			return
		}

		openDeleteEventModal({ target: selectedEvent })
	}, [onClose, openDeleteEventDeltaModal, openDeleteEventModal, selectedEvent])

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
					<ListItemText primary={selectedEvent.markerType === 'deltaState' ? 'Data point' : 'Event'} />
				</MenuItem>
			)}
			{selectedEvent && <Divider />}
			{selectedEvent && (
				<MenuItem onClick={onReplaceSelectedEvent} disabled={isRequestInFlight}>
					<ListItemText primary="Create data point" />
				</MenuItem>
			)}
			{(selectedEvent?.markerType === 'issuedAt' || selectedEvent?.markerType === 'deltaState') && (
				<MenuItem onClick={onRevokeSelectedEvent} disabled={isRequestInFlight}>
					<ListItemText primary="Resolve this event" />
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={20} />
						</ListItemIcon>
					)}
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'revokedAt' && (
				<MenuItem onClick={onUnrevokeSelectedEvent} disabled={isRequestInFlight}>
					<ListItemText primary="Unresolve this event" />
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={20} />
						</ListItemIcon>
					)}
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'issuedAt' && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this event" />
				</MenuItem>
			)}
			{selectedEvent?.markerType === 'deltaState' && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this data point" />
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
				<ListItemText primary="Resolve event here" />
			</MenuItem>
		</Menu>
	)
}

export const TimelineContextMenu = memo(TimelineContextMenuComponent)
