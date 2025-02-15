import Divider from '@mui/material/Divider'
import { useSearch } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import useEventTracks, { TimelineTrack } from './hooks/useEventTracks'
import { TrackContainer } from './styles'
import { TimelineTrackItemDragDrop } from './TimelineTrackItemDragDrop'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
	visible: boolean
	containerWidth: number
	contextMenuState: ReturnType<typeof getTimelineContextMenuState>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineTrackItem = ({
	track,
	visible,
	containerWidth,
	contextMenuState,
	realTimeToScaledTime,
}: Props) => {
	const dragDropReceiverRef = useRef<HTMLDivElement | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const theme = useCustomTheme()
	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline/_timeline',
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
