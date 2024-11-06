import { Stack } from '@mui/material'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import { ScaleLevel } from '../../types'
import useEventTracks from './hooks/useEventTracks'
import { TimelineTrackItem } from './TimelineTrackItem'

type Props = {
	anotherRef: React.RefObject<HTMLDivElement>
	visible: boolean
	scroll: number
	lineSpacing: number
	scaleLevel: ScaleLevel
	timelineScale: number
	containerWidth: number
}

export const TimelineTracks = (props: Props) => {
	const eventTracks = useEventTracks()
	const { stateOf, isLocationEqual } = useWorldRouter()
	const stateOfEventEditor = stateOf(worldRoutes.eventEditor)
	const stateOfDeltaEditor = stateOf(worldRoutes.eventDeltaEditor)
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
				maxHeight: 'calc(100% - 64px)',
				overflowX: 'hidden',
				overflowY: 'scroll',
			}}
		>
			{eventTracks.map((track) => (
				<TimelineTrackItem
					key={track.id}
					track={track}
					isLocationEqual={isLocationEqual}
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
