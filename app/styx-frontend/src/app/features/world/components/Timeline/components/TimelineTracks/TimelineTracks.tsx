import { Stack } from '@mui/material'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getWorldState } from '@/app/features/world/selectors'
import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'

import { ScaleLevel } from '../../types'
import { TimelineContextMenu } from '../TimelineContextMenu/TimelineContextMenu'
import useEventTracks from './hooks/useEventTracks'
import { TimelineTrackItem } from './TimelineTrackItem'

type Props = {
	anotherRef: React.RefObject<HTMLDivElement>
	visible: boolean
	scaleLevel: ScaleLevel
	containerWidth: number
}

export const TimelineTracksComponent = (props: Props) => {
	const eventTracks = useEventTracks()
	const { stateOf, isLocationEqual } = useWorldRouter()
	const stateOfEventEditor = stateOf(worldRoutes.eventEditor)
	const stateOfDeltaEditor = stateOf(worldRoutes.eventDeltaEditor)
	const worldState = useSelector(getWorldState)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const { realTimeToScaledTime } = useTimelineWorldTime({
		scaleLevel: props.scaleLevel,
		calendar: worldState.calendar,
	})

	return (
		<Stack
			ref={props.anotherRef}
			sx={{
				display: 'block',
				position: 'absolute',
				bottom: 25,
				width: '100%',
				maxHeight: 'calc(100% - 72px)',
				overflowX: 'hidden',
				overflowY: 'auto',
			}}
		>
			{eventTracks.map((track) => (
				<TimelineTrackItem
					key={track.id}
					track={track}
					isLocationEqual={isLocationEqual}
					worldState={worldState}
					contextMenuState={contextMenuState}
					eventEditorParams={stateOfEventEditor}
					eventDeltaEditorParams={stateOfDeltaEditor}
					realTimeToScaledTime={realTimeToScaledTime}
					{...props}
				/>
			))}
			<TimelineContextMenu markers={eventTracks.flatMap((track) => track.events)} />
		</Stack>
	)
}

export const TimelineTracks = memo(TimelineTracksComponent)
