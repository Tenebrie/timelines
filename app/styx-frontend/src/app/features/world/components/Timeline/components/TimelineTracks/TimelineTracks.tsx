import { Stack } from '@mui/material'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState } from '../../../../selectors'
import { ScaleLevel } from '../../types'
import useEventTracks from './hooks/useEventTracks'
import { TimelineTrackItem } from './TimelineTrackItem'

type Props = {
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
			justifyContent="flex-end"
			sx={{
				position: 'relative',
				height: 'calc(100%)',
				overflowX: 'hidden',
				overflowY: 'scroll',
				pointerEvents: 'none',
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
