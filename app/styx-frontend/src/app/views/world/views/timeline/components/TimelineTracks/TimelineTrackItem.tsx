import Divider from '@mui/material/Divider'
import { useSearch } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getTimelineState } from '@/app/views/world/WorldSliceSelectors'
import { isRunningInTest } from '@/test-utils/isRunningInTest'

import { TimelineState } from '../../utils/TimelineState'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle'
import { TimelineMarker } from './components/TimelineMarker'
import { TimelineTrack } from './hooks/useEventTracks'
import { TrackContainer } from './styles'
import { TimelineTrackItemDragDrop } from './TimelineTrackItemDragDrop'

type Props = {
	track: TimelineTrack
	trackCount: number
	visible: boolean
	containerWidth: number
	contextMenuState: ReturnType<typeof getTimelineContextMenuState>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineTrackItem = memo(TimelineTrackItemComponent)

export function TimelineTrackItemComponent({
	track,
	trackCount,
	visible,
	containerWidth,
	contextMenuState,
	realTimeToScaledTime,
}: Props) {
	const dragDropReceiverRef = useRef<HTMLDivElement | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const theme = useCustomTheme()
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})

	const selectedMarkers = useMemo(
		() =>
			track.events.filter(
				(entity) =>
					selectedMarkerIds.some((marker) => marker === entity.key) ||
					(contextMenuState.isOpen && contextMenuState.selectedEvent?.key === entity.key),
			),
		[contextMenuState, track.events, selectedMarkerIds],
	)
	const [visibleMarkers, setVisibleMarkers] = useState<(typeof track)['events']>([])

	const lastRecordedScroll = useRef<number | null>(null)
	const lastVisibleMarkers = useRef<(typeof track)['events']>([])
	const updateVisibleMarkersThrottled = useRef(
		throttle(
			(
				t: TimelineTrack,
				width: number,
				realTimeToScaledTime: Props['realTimeToScaledTime'],
				forceUpdate: boolean,
			) => {
				const prevScroll = lastRecordedScroll.current
				const staggerValue = track.position * (1000 / trackCount)
				if (
					!forceUpdate &&
					prevScroll !== null &&
					Math.abs(TimelineState.scroll - prevScroll + staggerValue) < 1000
				) {
					return
				}

				lastRecordedScroll.current = TimelineState.scroll
				const markers = t.events
					.filter((event) => {
						const position = realTimeToScaledTime(Math.floor(event.markerPosition)) + TimelineState.scroll

						return position >= -1000 && position <= width + 1000
					})
					.sort((a, b) => a.markerPosition - b.markerPosition)

				if (
					markers.length !== lastVisibleMarkers.current.length ||
					markers.some((marker, index) => marker !== lastVisibleMarkers.current[index])
				) {
					setVisibleMarkers(markers)
					lastVisibleMarkers.current = markers
				}
			},
			isRunningInTest() ? 0 : 1,
		),
	)

	const updateVisibleMarkers = useCallback(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime, false)
	}, [containerWidth, realTimeToScaledTime, track])

	useEffect(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime, true)
		updateVisibleMarkersThrottled.current.flush()
	}, [containerWidth, realTimeToScaledTime, track, updateVisibleMarkers, scaleLevel])

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: updateVisibleMarkers,
	})

	return (
		<TrackContainer
			ref={dragDropReceiverRef}
			$height={track.height}
			$background={theme.custom.palette.background.softest}
			className={`${isDragging ? 'dragging' : ''} allow-timeline-click`}
			data-trackid={track.id}
		>
			<Divider sx={{ position: 'absolute', bottom: 0, width: '100%', pointerEvents: 'none' }} />
			{visibleMarkers.map((event) => (
				<TimelineMarker
					key={event.key}
					marker={event}
					visible={visible}
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
	)
}
