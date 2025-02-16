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
	anotherRef: React.RefObject<HTMLDivElement | null>
	visible: boolean
	scaleLevel: ScaleLevel
	containerWidth: number
}

export const TimelineTracks = memo(TimelineTracksComponent)

export function TimelineTracksComponent(props: Props) {
	const { tracks } = useSelector(getTimelineState, (a, b) => a.tracks === b.tracks)
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
			preResizeScroll.current = props.anotherRef.current?.scrollTop ?? 0
		},
	})

	useLayoutEffect(() => {
		const timeline = props.anotherRef.current
		if (!timeline || needToScrollBy === 0) {
			return
		}

		const scrollLost = preResizeScroll.current - timeline.scrollTop

		timeline.scrollBy({ top: Math.round(needToScrollBy + scrollLost) })
		setNeedToScrollBy(0)
	}, [needToScrollBy, outlinerHeight, props.anotherRef])

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
			{/* TODO: Size of box is always equal to the height of the Outliner */}
			<Box sx={{ height: `calc(${outlinerHeight}px - 32px)`, pointerEvents: 'none' }} />
			{tracks.map((track) => (
				<TimelineTrackItem
					key={track.id}
					track={track}
					contextMenuState={contextMenuState}
					realTimeToScaledTime={realTimeToScaledTime}
					{...props}
				/>
			))}
			<TimelineContextMenu />
		</Stack>
	)
}
