import { Divider, Stack } from '@mui/material'
import { memo, useMemo } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useDragDropStateWithRenders } from '../../../../../dragDrop/DragDropState'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import { TimelineChainPositioner } from './components/TimelineChainPositioner/TimelineChainPositioner'
import { TimelineEventPositioner } from './components/TimelineEventPositioner/TimelineEventPositioner'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle/TimelineEventTrackTitle'
import { useEventDragDropReceiver } from './hooks/useEventDragDropReceiver'
import useEventTracks from './hooks/useEventTracks'

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

const TimelineTrackItemComponent = ({
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

	const { isDragging } = useDragDropStateWithRenders()
	const { ref } = useEventDragDropReceiver({
		track,
	})

	const dividerProps = useMemo(() => ({ position: 'absolute', bottom: 0, width: '100%' }), [])

	return (
		<Stack
			ref={ref}
			direction="row"
			width="100%"
			alignItems="center"
			sx={{
				position: 'relative',
				height: '96px',
				pointerEvents: isDragging ? 'auto' : 'none',
				'&:hover': {
					background: isDragging ? 'rgb(255 255 255 / 10%)' : 'none',
				},
			}}
		>
			<Divider sx={dividerProps} />
			<Stack
				style={{
					transform: `translateX(${scroll}px)`,
				}}
			>
				{chainLinks.map((event) => (
					<TimelineChainPositioner
						key={event.key}
						entity={event}
						visible={visible}
						scroll={0}
						lineSpacing={lineSpacing}
						timelineScale={timelineScale}
						containerWidth={containerWidth}
						highlighted={highlightedEvents.includes(event)}
						realTimeToScaledTime={realTimeToScaledTime}
					/>
				))}
				{track.events.map((event) => (
					<TimelineEventPositioner
						key={event.key}
						entity={event}
						visible={visible}
						scroll={0}
						lineSpacing={lineSpacing}
						timelineScale={timelineScale}
						containerWidth={containerWidth}
						highlighted={highlightedEvents.includes(event)}
						realTimeToScaledTime={realTimeToScaledTime}
					/>
				))}
			</Stack>
			<TimelineEventTrackTitle track={track} />
		</Stack>
	)
}

export const TimelineTrackItem = memo(TimelineTrackItemComponent)
