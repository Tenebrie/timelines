import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useSearch } from '@tanstack/react-router'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import {
	getSelectedMarkerKeys,
	getTimelineContextMenuState,
	getTimelineState,
} from '@/app/views/world/WorldSliceSelectors'

import { TimelineTrack } from '../hooks/useEventTracks'
import { TimelineState } from '../utils/TimelineState'
import { ControlledScroller, EVENT_SCROLL_RESET_PERIOD } from './components/ControlledScroller'
import { TimelineEventTrackTitle } from './marker/TimelineEventTrackTitle'
import { TimelineMarkerWithChain } from './marker/TimelineMarkerWithChain'
import { TrackContainer } from './styles'
import { TimelineTracksItemDragDrop } from './TimelineTracksItemDragDrop'

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
	const selectedMarkerIds = useSelector(getSelectedMarkerKeys)
	const theme = useCustomTheme()
	const { trackActive } = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => ({ trackActive: search.track === track.id }),
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
		(
			t: TimelineTrack,
			width: number,
			realTimeToScaledTime: Props['realTimeToScaledTime'],
			forceUpdate: boolean,
		) => {
			const prevScroll = lastRecordedScroll.current
			const staggerPosition = Math.abs(track.position) === Infinity ? 0 : track.position
			const staggerValue = staggerPosition * (1000 / trackCount)
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
					if (position >= -1250 && position <= width + 1250) {
						return true
					}

					if (!event.chainEntity) {
						return false
					}

					const chainBasePosition = event.chainEntity.markerPosition
					const chainPosition = realTimeToScaledTime(Math.floor(chainBasePosition)) + TimelineState.scroll

					if (chainPosition >= -1250 && chainPosition <= width + 1250) {
						return true
					}
					return position < 0 && chainPosition > 0
				})
				.filter((event) => {
					if (!event.followingEntity) {
						return true
					}

					const diff = event.followingEntity?.markerPosition - event.markerPosition
					const pixelsToNext = realTimeToScaledTime(diff)
					return pixelsToNext >= 1
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
	)

	const updateVisibleMarkers = useCallback(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime, false)
	}, [containerWidth, realTimeToScaledTime, track])

	useEffect(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime, true)
	}, [containerWidth, realTimeToScaledTime, track, updateVisibleMarkers, scaleLevel])

	useEventBusSubscribe['timeline/onScroll']({
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
			data-testid="TimelineTrack"
		>
			{track.id !== 'default' && (
				<Divider sx={{ position: 'absolute', bottom: 0, width: '100%', pointerEvents: 'none' }} />
			)}
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
					<TimelineMarkerWithChain
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
			<TimelineTracksItemDragDrop
				track={track}
				receiverRef={dragDropReceiverRef}
				onDragChanged={setIsDragging}
			/>
		</TrackContainer>
	)
}
