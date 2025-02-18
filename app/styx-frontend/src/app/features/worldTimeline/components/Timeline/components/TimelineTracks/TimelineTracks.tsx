import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { memo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getTimelineState, getWorldState } from '@/app/features/world/selectors'

import { ScaleLevel } from '../../types'
import { TimelineContextMenu } from '../TimelineContextMenu/TimelineContextMenu'
import { TimelineTrackItem } from './TimelineTrackItem'
import { useOutlinerHeightListener } from './useOutlinerHeightListener'

type Props = {
	visible: boolean
	scaleLevel: ScaleLevel
	containerWidth: number
}

export const TimelineTracks = memo(TimelineTracksComponent)

export function TimelineTracksComponent(props: Props) {
	const ref = useRef<HTMLDivElement | null>(null)

	const { allTracks, loadingTracks } = useSelector(
		getTimelineState,
		(a, b) => a.allTracks === b.allTracks && a.loadingTracks === b.loadingTracks,
	)
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const { realTimeToScaledTime } = useTimelineWorldTime({
		scaleLevel: props.scaleLevel,
		calendar,
	})

	const { outlinerHeight } = useOutlinerHeightListener({ ref })

	return (
		<Stack
			ref={ref}
			sx={{
				display: 'block',
				position: 'absolute',
				bottom: 25,
				width: '100%',
				maxHeight: 'calc(100% - 72px)',
				overflowX: 'hidden',
				overflowY: 'auto',
			}}
			className={'allow-timeline-click'}
		>
			{/* TODO: Size of box is always equal to the height of the Outliner */}
			<Box sx={{ height: `calc(${outlinerHeight}px - 32px)`, pointerEvents: 'none' }} />
			<Box
				style={{ opacity: loadingTracks ? 0 : 1 }}
				sx={{
					pointerEvents: 'none',
					transition: 'opacity 0.3s',
				}}
			>
				{allTracks.map((track) => (
					<Collapse in={track.visible} key={track.id} mountOnEnter unmountOnExit>
						<TimelineTrackItem
							track={track}
							trackCount={allTracks.length}
							contextMenuState={contextMenuState}
							realTimeToScaledTime={realTimeToScaledTime}
							{...props}
						/>
					</Collapse>
				))}
			</Box>
			<TimelineContextMenu />
		</Stack>
	)
}
