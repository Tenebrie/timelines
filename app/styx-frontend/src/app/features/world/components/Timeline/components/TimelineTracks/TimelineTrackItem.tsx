import { Divider } from '@mui/material'
import throttle from 'lodash.throttle'
import { Profiler, useEffect, useMemo, useRef, useState } from 'react'

import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getWorldState } from '@/app/features/world/selectors'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { TimelineChainPositioner } from './components/TimelineChainPositioner/TimelineChainPositioner'
import { TimelineEventPositioner } from './components/TimelineEventPositioner/TimelineEventPositioner'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle/TimelineEventTrackTitle'
import useEventTracks, { TimelineTrack } from './hooks/useEventTracks'
import { TrackContainer, TrackPositioner } from './styles'
import { TimelineTrackItemDragDrop } from './TimelineTrackItemDragDrop'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
	lineSpacing: number
	scroll: number
	visible: boolean
	containerWidth: number
	isLocationEqual: ReturnType<typeof useWorldRouter>['isLocationEqual']
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
	lineSpacing,
	scroll,
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
						isLocationEqual('/world/:worldId/editor/:eventId') &&
						eventEditorParams.eventId === entity.eventId) ||
					(isLocationEqual('/world/:worldId/editor/:eventId/delta/:deltaId') &&
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
	const [visibleMarkers, setVisibleMarkers] = useState(track.events)

	const updateVisibleMarkersThrottled = useRef(
		throttle(
			(t: TimelineTrack, scr: number, width: number, realTimeToScaledTime: Props['realTimeToScaledTime']) => {
				setVisibleMarkers(
					t.events.filter((event) => {
						const position = realTimeToScaledTime(Math.floor(event.markerPosition)) + scr
						return position >= -250 && position <= width + 250
					}),
				)
			},
			100,
		),
	)

	useEffect(() => {
		updateVisibleMarkersThrottled.current(track, scroll, containerWidth, realTimeToScaledTime)
	}, [scroll, track, containerWidth, realTimeToScaledTime])

	const chainLinks = useMemo(() => {
		return track.events.filter((event) => event.nextEntity)
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
				<TrackPositioner $position={0}>
					{chainLinks.map((event) => (
						<TimelineChainPositioner
							key={event.key}
							entity={event}
							visible={visible}
							edited={false}
							selected={false}
							scroll={scroll}
							realTimeToScaledTime={realTimeToScaledTime}
						/>
					))}
					{visibleMarkers.map((event) => (
						<TimelineEventPositioner
							key={event.key}
							entity={event}
							visible={visible}
							lineSpacing={lineSpacing}
							scroll={scroll}
							edited={editedEntities.some((marker) => marker.key === event.key)}
							selected={selectedMarkers.some((marker) => marker.key === event.key)}
							trackHeight={track.height}
							realTimeToScaledTime={realTimeToScaledTime}
						/>
					))}
				</TrackPositioner>
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
