import { Divider } from '@mui/material'
import { useMemo, useRef, useState } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import { TimelineChainPositioner } from './components/TimelineChainPositioner/TimelineChainPositioner'
import { TimelineEventPositioner } from './components/TimelineEventPositioner/TimelineEventPositioner'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle/TimelineEventTrackTitle'
import useEventTracks from './hooks/useEventTracks'
import { TrackContainer, TrackPositioner } from './styles'
import { TimelineTrackItemDragDrop } from './TimelineTrackItemDragDrop'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
	lineSpacing: number
	timelineScale: number
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
	contextMenuState: ReturnType<typeof getTimelineContextMenuState>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineTrackItem = ({
	track,
	lineSpacing,
	timelineScale,
	scroll,
	visible,
	containerWidth,
	isLocationEqual,
	eventEditorParams,
	eventDeltaEditorParams,
	contextMenuState,
	realTimeToScaledTime,
}: Props) => {
	const dragDropReceiverRef = useRef<HTMLDivElement | null>(null)
	const [isDragging, setIsDragging] = useState(false)

	const highlightedEvents = useMemo(
		() =>
			track.events.filter(
				(entity) =>
					(isLocationEqual('/world/:worldId/editor/:eventId') && eventEditorParams.eventId === entity.id) ||
					(isLocationEqual('/world/:worldId/editor/:eventId/delta/:deltaId') &&
						eventDeltaEditorParams.deltaId === entity.id) ||
					(contextMenuState.isOpen && contextMenuState.selectedEvent?.id === entity.id),
			),
		[
			contextMenuState.isOpen,
			contextMenuState.selectedEvent,
			eventDeltaEditorParams.deltaId,
			eventEditorParams.eventId,
			isLocationEqual,
			track.events,
		],
	)

	const chainLinks = useMemo(() => {
		return track.events.filter((event) => event.nextEntity)
	}, [track.events])

	const dividerProps = useMemo(() => ({ position: 'absolute', bottom: 0, width: '100%' }), [])

	return (
		<TrackContainer ref={dragDropReceiverRef} className={`${isDragging ? 'dragging' : ''}`}>
			<Divider sx={dividerProps} />
			<TrackPositioner $position={scroll}>
				{chainLinks.map((event) => (
					<TimelineChainPositioner
						key={event.key}
						entity={event}
						visible={visible}
						timelineScale={timelineScale}
						highlighted={highlightedEvents.includes(event)}
						realTimeToScaledTime={realTimeToScaledTime}
					/>
				))}
				{track.events.map((event) => (
					<TimelineEventPositioner
						key={event.key}
						entity={event}
						visible={visible}
						lineSpacing={lineSpacing}
						timelineScale={timelineScale}
						highlighted={highlightedEvents.includes(event)}
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
	)
}
