import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { memo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import {
	getTimelineContextMenuState,
	getTimelineState,
	getWorldState,
} from '@/app/views/world/WorldSliceSelectors'

import { TimelineContextMenu } from '../components/TimelineContextMenu/TimelineContextMenu'
import { useOutlinerHeightListener } from './hooks/useOutlinerHeightListener'
import { TimelineTracksItem } from './TimelineTracksItem'

type Props = {
	containerWidth: number
}

export const TimelineTracks = memo(TimelineTracksComponent)

export function TimelineTracksComponent(props: Props) {
	const ref = useRef<HTMLDivElement | null>(null)

	const { allTracks, loadingTracks, scaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) =>
			a.allTracks === b.allTracks &&
			a.loadingTracks === b.loadingTracks &&
			a.scaleLevel === b.scaleLevel &&
			a.isSwitchingScale === b.isSwitchingScale,
	)
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const visible = !isSwitchingScale
	const { realTimeToScaledTime } = useTimelineWorldTime({
		scaleLevel,
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
				...useBrowserSpecificScrollbars(),
			}}
			className={'allow-timeline-click'}
		>
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
						<TimelineTracksItem
							visible={visible}
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
