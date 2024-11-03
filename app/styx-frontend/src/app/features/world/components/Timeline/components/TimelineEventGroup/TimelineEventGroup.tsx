import { Divider, Stack } from '@mui/material'
import { useMemo } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useDragDropStateWithRenders } from '../../../../../dragDrop/DragDropState'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import useEventTracks from '../../hooks/useEventTracks'
import { TimelineEventPositioner } from './components/TimelineEventPositioner/TimelineEventPositioner'
import { TimelineEventTrackTitle } from './components/TimelineEventTrackTitle/TimelineEventTrackTitle'
import { useEventDragDropReceiver } from './hooks/useEventDragDropReceiver'

type Props = {
	track: ReturnType<typeof useEventTracks>[number]
	scroll: number
	timelineScale: number
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

export const TimelineEventGroup = ({
	track,
	scroll,
	timelineScale,
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

	const { isDragging } = useDragDropStateWithRenders()
	const { ref } = useEventDragDropReceiver({
		track,
	})

	return (
		<Stack
			ref={ref}
			direction="row"
			width="100%"
			alignItems="center"
			sx={{
				position: 'relative',
				flexShrink: 0,
				height: 96,
				pointerEvents: isDragging ? 'auto' : 'none',
				'&:hover': {
					background: isDragging ? 'rgb(255 255 255 / 10%)' : 'none',
				},
			}}
		>
			<Divider sx={{ position: 'absolute', bottom: 0, width: '100%' }} />
			<TimelineEventTrackTitle track={track} />
			{track.events.map((event) => (
				<TimelineEventPositioner
					key={event.key}
					entity={event}
					visible={visible}
					scroll={scroll}
					timelineScale={timelineScale}
					containerWidth={containerWidth}
					highlighted={highlightedEvents.includes(event)}
					realTimeToScaledTime={realTimeToScaledTime}
				/>
			))}
		</Stack>
	)
}
