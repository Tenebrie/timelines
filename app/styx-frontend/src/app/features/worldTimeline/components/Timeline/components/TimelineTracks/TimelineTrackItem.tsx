import Divider from '@mui/material/Divider'
import throttle from 'lodash.throttle'
import { Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getWorldState } from '@/app/features/worldTimeline/selectors'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { isRunningInTest } from '@/jest/isRunningInTest'
import { useWorldTimelineRouter } from '@/router/routes/featureRoutes/worldTimelineRoutes'

import { TimelineState } from '../../utils/TimelineState'
import { TimelineChainPositioner } from './components/TimelineChainPositioner/TimelineChainPositioner'
import { TimelineEventPositioner } from './components/TimelineEventPositioner/TimelineEventPositioner'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle/TimelineEventTrackTitle'
import useEventTracks, { TimelineTrack } from './hooks/useEventTracks'
import { TrackContainer } from './styles'
import { TimelineTrackItemDragDrop } from './TimelineTrackItemDragDrop'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
	visible: boolean
	containerWidth: number
	isLocationEqual: ReturnType<typeof useWorldTimelineRouter>['isLocationEqual']
	eventEditorParams: {
		eventId: string
	}
	eventDeltaEditorParams: {
		deltaId: string
	}
	worldState: ReturnType<typeof getWorldState>
	contextMenuState: ReturnType<typeof getTimelineContextMenuState>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineTrackItem = ({
	track,
	visible,
	containerWidth,
	isLocationEqual,
	eventEditorParams,
	eventDeltaEditorParams,
	worldState,
	contextMenuState,
	realTimeToScaledTime,
}: Props) => {
	const dragDropReceiverRef = useRef<HTMLDivElement | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const theme = useCustomTheme()

	const editedEntities = useMemo(
		() =>
			track.events.filter(
				(entity) =>
					(['issuedAt', 'revokedAt'].includes(entity.markerType) &&
						isLocationEqual('/world/:worldId/timeline/editor/:eventId') &&
						eventEditorParams.eventId === entity.eventId) ||
					(isLocationEqual('/world/:worldId/timeline/editor/:eventId/delta/:deltaId') &&
						eventDeltaEditorParams.deltaId === entity.id),
			),
		[eventDeltaEditorParams, eventEditorParams, isLocationEqual, track.events],
	)

	const selectedMarkers = useMemo(
		() =>
			track.events.filter(
				(entity) =>
					worldState.selectedTimelineMarkers.includes(entity.key) ||
					(contextMenuState.isOpen && contextMenuState.selectedEvent?.key === entity.key),
			),
		[contextMenuState, track.events, worldState.selectedTimelineMarkers],
	)
	const [visibleMarkers, setVisibleMarkers] = useState<(typeof track)['events']>([])

	const updateVisibleMarkersThrottled = useRef(
		throttle(
			(t: TimelineTrack, width: number, realTimeToScaledTime: Props['realTimeToScaledTime']) => {
				setVisibleMarkers(
					t.events.filter((event) => {
						const position = realTimeToScaledTime(Math.floor(event.markerPosition)) + TimelineState.scroll
						return position >= -250 && position <= width + 250
					}),
				)
			},
			isRunningInTest() ? 0 : 100,
		),
	)

	const updateVisibleMarkers = useCallback(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime)
	}, [containerWidth, realTimeToScaledTime, track])

	useEffect(() => {
		updateVisibleMarkers()
	}, [updateVisibleMarkers])

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: updateVisibleMarkers,
	})

	const chainLinks = useMemo(() => {
		return track.events.filter(
			(event) => event.markerType === 'issuedAt' || event.markerType === 'deltaState',
		)
	}, [track.events])

	const dividerProps = useMemo(() => ({ position: 'absolute', bottom: 0, width: '100%' }), [])

	return (
		<Profiler id="TimelineTrackItem" onRender={reportComponentProfile}>
			<TrackContainer
				ref={dragDropReceiverRef}
				$height={track.height}
				$background={theme.custom.palette.background.soft}
				className={`${isDragging ? 'dragging' : ''}`}
			>
				<Divider sx={dividerProps} />
				{chainLinks.map((event) => (
					<TimelineChainPositioner
						key={event.key}
						entity={event}
						visible={visible}
						edited={false}
						selected={false}
						realTimeToScaledTime={realTimeToScaledTime}
					/>
				))}
				{visibleMarkers.map((event) => (
					<TimelineEventPositioner
						key={event.key}
						entity={event}
						visible={visible}
						edited={editedEntities.some((marker) => marker.key === event.key)}
						selected={selectedMarkers.some((marker) => marker.key === event.key)}
						trackHeight={track.height}
						realTimeToScaledTime={realTimeToScaledTime}
					/>
				))}
				<TimelineEventTrackTitle track={track} />
				<TimelineTrackItemDragDrop
					track={track}
					receiverRef={dragDropReceiverRef}
					onDragChanged={setIsDragging}
				/>
			</TrackContainer>
		</Profiler>
	)
}
