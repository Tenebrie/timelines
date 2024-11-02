import { Button, Divider } from '@mui/material'
import { useMemo } from 'react'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import useEventTracks from '../../hooks/useEventTracks'
import { TimelineTrackWrapper } from '../TimelineTracks/components/TimelineTrackWrapper'
import { TimelineEventPositioner } from './components/TimelineEventPositioner/TimelineEventPositioner'

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

	return (
		<TimelineTrackWrapper>
			<Divider sx={{ position: 'absolute', top: 0, width: '100%' }} />
			<Button sx={{ marginLeft: 4, pointerEvents: 'all' }}>{track.name}</Button>
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
		</TimelineTrackWrapper>
	)
}
