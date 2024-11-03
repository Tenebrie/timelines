import { Stack } from '@mui/material'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import useEventTracks from '../../hooks/useEventTracks'
import { TimelineEventGroup } from '../TimelineEventGroup/TimelineEventGroup'

type Props = {
	scroll: number
	timelineScale: number
	visible: boolean
	containerWidth: number
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineTracks = (props: Props) => {
	const eventTracks = useEventTracks()
	const { stateOf, isLocationEqual } = useWorldRouter()
	const stateOfEventEditor = stateOf(worldRoutes.eventEditor)
	const stateOfDeltaEditor = stateOf(worldRoutes.eventDeltaEditor)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	return (
		<Stack
			justifyContent="flex-end"
			sx={{
				position: 'relative',
				height: 'calc(100%)',
				pointerEvents: 'none',
				overflowX: 'hidden',
				overflowY: 'scroll',
			}}
		>
			{eventTracks.map((track) => (
				<TimelineEventGroup
					key={track.id}
					track={track}
					isLocationEqual={isLocationEqual}
					contextMenuState={contextMenuState}
					eventEditorParams={stateOfEventEditor}
					eventDeltaEditorParams={stateOfDeltaEditor}
					{...props}
				/>
			))}
		</Stack>
	)
}
