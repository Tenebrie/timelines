import Divider from '@mui/material/Divider'
import { useSearch } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { memo, Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '@/app/features/world/selectors'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { isRunningInTest } from '@/test-utils/isRunningInTest'

import { TimelineState } from '../../utils/TimelineState'
import { TimelineChainPositioner } from './components/TimelineChainPositioner'
import { TimelineEventPositioner } from './components/TimelineEventPositioner'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle'
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
				setVisibleMarkers(
					t.events.filter((event) => {
						const position = realTimeToScaledTime(Math.floor(event.markerPosition)) + TimelineState.scroll

						return position >= -1000 && position <= width + 1000
					}),
				)
			},
			isRunningInTest() ? 0 : 100,
		),
	)

	const updateVisibleMarkers = useCallback(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime, false)
	}, [containerWidth, realTimeToScaledTime, track])

	useEffect(() => {
		updateVisibleMarkersThrottled.current(track, containerWidth, realTimeToScaledTime, true)
	}, [containerWidth, realTimeToScaledTime, track, updateVisibleMarkers])

	useEventBusSubscribe({
		event: 'timelineScrolled',
		callback: updateVisibleMarkers,
	})

	// useEffect(() => {
	// 	updateVisibleMarkers()
	// }, [updateVisibleMarkers])

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
				$background={theme.custom.palette.background.softest}
				className={`${isDragging ? 'dragging' : ''} allow-timeline-click`}
				data-trackid={track.id}
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
						edited={false}
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
