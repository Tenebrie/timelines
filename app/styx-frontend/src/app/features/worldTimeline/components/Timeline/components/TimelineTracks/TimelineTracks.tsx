import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { memo, startTransition, useLayoutEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineContextMenuState, getTimelineState, getWorldState } from '@/app/features/world/selectors'

import { ScaleLevel } from '../../types'
import { TimelineContextMenu } from '../TimelineContextMenu/TimelineContextMenu'
import { TimelineTrackItem } from './TimelineTrackItem'

type Props = {
	visible: boolean
	scaleLevel: ScaleLevel
	containerWidth: number
}

export const TimelineTracks = memo(TimelineTracksComponent)

export function TimelineTracksComponent(props: Props) {
	const anotherRef = useRef<HTMLDivElement | null>(null)

	const { tracks, loadingTracks } = useSelector(
		getTimelineState,
		(a, b) => a.tracks === b.tracks && a.loadingTracks === b.loadingTracks,
	)
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const contextMenuState = useSelector(getTimelineContextMenuState)

	const { realTimeToScaledTime } = useTimelineWorldTime({
		scaleLevel: props.scaleLevel,
		calendar,
	})

	const [outlinerHeight, setOutlinerHeight] = useState(300)
	const [needToScrollBy, setNeedToScrollBy] = useState(0)
	const preResizeScroll = useRef(0)
	useEventBusSubscribe({
		event: 'outlinerResized',
		callback: ({ height }) => {
			const diff = height - outlinerHeight
			startTransition(() => {
				setOutlinerHeight(height)
				setNeedToScrollBy(diff)
			})
			preResizeScroll.current = anotherRef.current?.scrollTop ?? 0
		},
	})

	useLayoutEffect(() => {
		const timeline = anotherRef.current
		if (!timeline || needToScrollBy === 0) {
			return
		}

		const scrollLost = preResizeScroll.current - timeline.scrollTop

		timeline.scrollBy({ top: Math.round(needToScrollBy + scrollLost) })
		setNeedToScrollBy(0)
	}, [needToScrollBy, outlinerHeight, anotherRef])

	return (
		<Stack
			ref={anotherRef}
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
				{tracks.map((track) => (
					<TimelineTrackItem
						key={track.id}
						track={track}
						trackCount={tracks.length}
						contextMenuState={contextMenuState}
						realTimeToScaledTime={realTimeToScaledTime}
						{...props}
					/>
				))}
			</Box>
			<TimelineContextMenu />
		</Stack>
	)
}
