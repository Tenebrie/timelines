import { Stack } from '@mui/material'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getWorldState } from '../../../../selectors'
import { ScaleLevel } from '../../types'
import useEventTracks from './hooks/useEventTracks'
import { TimelineTrackItem } from './TimelineTrackItem'

type Props = {
	anotherRef: React.RefObject<HTMLDivElement>
	visible: boolean
	scroll: number
	lineSpacing: number
	scaleLevel: ScaleLevel
	containerWidth: number
}

export const TimelineTracks = (props: Props) => {
	const eventTracks = useEventTracks()
	const { stateOf, isLocationEqual } = useWorldRouter()
	const stateOfEventEditor = stateOf(worldRoutes.eventEditor)
	const stateOfDeltaEditor = stateOf(worldRoutes.eventDeltaEditor)
	const worldState = useSelector(getWorldState)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel: props.scaleLevel })

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
		</Stack>
	)
}
