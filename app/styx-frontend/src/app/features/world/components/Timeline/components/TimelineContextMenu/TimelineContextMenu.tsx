import { CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/reducer'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '@/app/features/world/hooks/useTimelineBus'
import { worldSlice } from '@/app/features/world/reducer'
import { getTimelineContextMenuState, getWorldState } from '@/app/features/world/selectors'
import { MarkerType, TimelineEntity } from '@/app/features/world/types'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { useTimelineContextMenuRequests } from './hooks/useTimelineContextMenuRequests'

type Props = {
	markers: TimelineEntity<MarkerType>[]
}

export const TimelineContextMenuComponent = ({ markers }: Props) => {
	const { timeToLabel } = useWorldTime()
	const { id: worldId, selectedTimelineMarkers } = useSelector(getWorldState)
	const { clearSelections } = worldSlice.actions
	const {
		isOpen,
		selectedTime,
		selectedEvent: targetedMarker,
		mousePos,
	} = useSelector(getTimelineContextMenuState)

	const selectedMarker = useMemo(
		() =>
			selectedTimelineMarkers.length === 1
				? (markers.find((marker) => marker.key === selectedTimelineMarkers[0]) ?? null)
				: null,
		[markers, selectedTimelineMarkers],
	)

	const { navigateToEventCreator, navigateToEventDeltaCreator } = useWorldRouter()

	const { revokeEventAt, unrevokeEventAt, isRequestInFlight } = useTimelineContextMenuRequests()

	const dispatch = useDispatch()
	const { closeTimelineContextMenu, setSelectedTime } = worldSlice.actions
	const { open: openDeleteEventModal } = useModal('deleteEventModal')
	const { open: openDeleteEventDeltaModal } = useModal('deleteEventDeltaModal')

	const onClose = useCallback(
		() => dispatch(closeTimelineContextMenu()),
		[closeTimelineContextMenu, dispatch],
	)

	const scrollTimelineTo = useTimelineBusDispatch()

	const onCreateEvent = useCallback(() => {
		onClose()
		navigateToEventCreator()
		scrollTimelineTo(selectedTime)
		dispatch(setSelectedTime(selectedTime))
	}, [onClose, navigateToEventCreator, scrollTimelineTo, selectedTime, dispatch, setSelectedTime])

	const onReplaceSelectedEvent = useCallback(() => {
		onClose()
		if (!selectedMarker) {
			return
		}
		navigateToEventDeltaCreator({
			eventId: selectedMarker.eventId,
		})
		scrollTimelineTo(selectedTime)
		dispatch(setSelectedTime(selectedTime))
	}, [
		dispatch,
		navigateToEventDeltaCreator,
		onClose,
		scrollTimelineTo,
		selectedMarker,
		selectedTime,
		setSelectedTime,
	])

	const onResolveSelectedEvent = useCallback(async () => {
		if (!selectedMarker) {
			return
		}

		await revokeEventAt({
			worldId,
			eventId: selectedMarker.eventId,
			revokedAt: selectedTime,
		})

		onClose()
	}, [onClose, revokeEventAt, selectedMarker, selectedTime, worldId])

	const onUnrevokeSelectedEvent = useCallback(async () => {
		if (!targetedMarker) {
			return
		}

		await unrevokeEventAt({
			worldId,
			eventId: targetedMarker.eventId,
		})

		onClose()
	}, [onClose, targetedMarker, unrevokeEventAt, worldId])

	const onDeleteSelectedEvent = useCallback(() => {
		onClose()

		if (!targetedMarker) {
			return
		}

		if (targetedMarker.markerType === 'deltaState') {
			const deltaState = targetedMarker.deltaStates.find((state) => state.id === targetedMarker.id)
			if (!deltaState) {
				return
			}

			openDeleteEventDeltaModal({ target: deltaState })
			return
		}

		openDeleteEventModal({ target: targetedMarker })
	}, [onClose, openDeleteEventDeltaModal, openDeleteEventModal, targetedMarker])

	const onUnselectAll = useCallback(() => {
		dispatch(clearSelections())
		onClose()
	}, [clearSelections, dispatch, onClose])

	return (
		<Menu
			open={isOpen}
			onClose={onClose}
			defaultValue={undefined}
			MenuListProps={{ sx: { minWidth: 250 } }}
			anchorReference="anchorPosition"
			anchorPosition={{ top: mousePos.y, left: mousePos.x }}
		>
			{/* Click on marker */}
			{targetedMarker && (
				<MenuItem disabled>
					<ListItemText
						primary={
							targetedMarker.markerType === 'deltaState'
								? 'Data point'
								: targetedMarker.markerType === 'issuedAt'
									? 'Event'
									: 'Event resolution'
						}
					/>
				</MenuItem>
			)}
			{targetedMarker && <Divider />}
			{targetedMarker?.markerType === 'revokedAt' && (
				<MenuItem onClick={onUnrevokeSelectedEvent} disabled={isRequestInFlight}>
					<ListItemText primary="Remove event end time" />
					{isRequestInFlight && (
						<ListItemIcon>
							<CircularProgress size={20} />
						</ListItemIcon>
					)}
				</MenuItem>
			)}
			{targetedMarker?.markerType === 'issuedAt' && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this event" />
				</MenuItem>
			)}
			{targetedMarker?.markerType === 'deltaState' && (
				<MenuItem onClick={onDeleteSelectedEvent}>
					<ListItemText primary="Delete this data point" />
				</MenuItem>
			)}

			{/* Click on timeline with exactly one selected */}
			{!targetedMarker && selectedMarker && (
				<MenuItem disabled>
					<ListItemText
						primary={
							selectedMarker.markerType === 'deltaState'
								? 'Data point'
								: selectedMarker.markerType === 'issuedAt'
									? 'Event'
									: 'Event resolution'
						}
					/>
				</MenuItem>
			)}
			{!targetedMarker && selectedMarker && <Divider />}
			{!targetedMarker && selectedMarker && selectedMarker.markerType !== 'revokedAt' && (
				<MenuItem onClick={onReplaceSelectedEvent}>
					<ListItemText primary="Create data point" />
				</MenuItem>
			)}
			{!targetedMarker && selectedMarker && (
				<MenuItem onClick={onResolveSelectedEvent}>
					<ListItemText primary="Resolve event" />
				</MenuItem>
			)}
			{!targetedMarker && selectedMarker && <Divider />}

			{/* Click on timeline with at least one selected */}
			{!targetedMarker && selectedTimelineMarkers.length > 0 && (
				<MenuItem onClick={onUnselectAll}>
					<ListItemText primary="Unselect all" />
				</MenuItem>
			)}
			{!targetedMarker && selectedTimelineMarkers.length > 0 && <Divider />}

			{/* Click on timeline */}
			{!targetedMarker && (
				<MenuItem disabled>
					<ListItemText primary={timeToLabel(selectedTime)} />
				</MenuItem>
			)}
			{!targetedMarker && <Divider />}
			{!targetedMarker && (
				<MenuItem onClick={onCreateEvent}>
					<ListItemText primary="Create event" />
				</MenuItem>
			)}
		</Menu>
	)
}

export const TimelineContextMenu = memo(TimelineContextMenuComponent)
