import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useSearch } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getTimelineState } from '@/app/views/world/WorldSliceSelectors'
import { isRunningInTest } from '@/test-utils/isRunningInTest'

import { TimelineTrack } from '../hooks/useEventTracks'
import { TimelineState } from '../utils/TimelineState'
import {
	CONTROLLED_SCROLLER_SIZE,
	ControlledScroller,
	EVENT_SCROLL_RESET_PERIOD,
} from './components/ControlledScroller'
import { TimelineTrackItemDragDrop } from './dragDrop/TimelineTrackItemDragDrop'
import { TimelineEventTrackTitle } from './marker/TimelineEventTrackTitle'
import { TimelineMarker } from './marker/TimelineMarker'
import { TrackContainer } from './styles'

type Props = {
	track: TimelineTrack
	trackCount: number
	visible: boolean
	containerWidth: number
	contextMenuState: ReturnType<typeof getTimelineContextMenuState>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineTracksItem = memo(TimelineTracksItemComponent)

export function TimelineTracksItemComponent({
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
	const { selectedMarkerIds, trackActive } = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => ({ selectedMarkerIds: search.selection, trackActive: search.track === track.id }),
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
						const position =
							realTimeToScaledTime(Math.floor(event.markerPosition)) +
							TimelineState.scroll -
							CONTROLLED_SCROLLER_SIZE

						return position >= -3000 && position <= width + 3000
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
		event: 'timeline/onScroll',
		callback: updateVisibleMarkers,
	})

	return (
		<TrackContainer
			ref={dragDropReceiverRef}
			$height={track.height}
			$hoverBg={theme.custom.palette.background.softest}
			$activeBg={theme.custom.palette.background.softer}
			className={`${isDragging ? 'dragging' : ''} allow-timeline-click ${trackActive ? 'active' : ''}`}
			data-trackid={track.id}
		>
			<Divider sx={{ position: 'absolute', bottom: 0, width: '100%', pointerEvents: 'none' }} />
			<Box
				sx={{
					position: 'absolute',
					bottom: 0,
					width: '100%',
					height: '100%',
					pointerEvents: 'none',
					opacity: trackActive ? 0.1 : 0,
					transition: 'opacity 0.3s',
					background: theme.material.palette.primary.main,
				}}
			/>
			<ControlledScroller resetPeriod={EVENT_SCROLL_RESET_PERIOD}>
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
			</ControlledScroller>
			<TimelineEventTrackTitle track={track} />
			<TimelineTrackItemDragDrop
				track={track}
				receiverRef={dragDropReceiverRef}
				onDragChanged={setIsDragging}
			/>
		</TrackContainer>
	)
}
