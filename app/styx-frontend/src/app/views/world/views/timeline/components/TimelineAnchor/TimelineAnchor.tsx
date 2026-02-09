import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { useTimelineAnchorDrag } from '../../hooks/useTimelineAnchorDrag'
import { useTimelineHorizontalScroll } from '../../hooks/useTimelineHorizontalScroll'
import { TimelineAnchorContainer } from './TimelineAnchorContainer'
import { TimelineAnchorLabel } from './TimelineAnchorLabel'

export const TimelineAnchorPadding = 150 // pixels

type Props = {
	containerWidth: number
}

export const TimelineAnchor = memo(TimelineAnchorComponent)

function TimelineAnchorComponent({ containerWidth }: Props) {
	const theme = useCustomTheme()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const { scaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) => a.scaleLevel === b.scaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel, calendar })

	// Drag-to-scroll functionality
	const { isDragging, onMouseDown, onMouseMove, onMouseUp } = useTimelineAnchorDrag()

	// Wheel scrolling
	const { onWheel } = useTimelineHorizontalScroll({ containerRef })

	// Set up mouse event listeners for dragging
	useEffect(() => {
		if (!isDragging) {
			return
		}

		document.addEventListener('mousemove', onMouseMove)
		document.addEventListener('mouseup', onMouseUp)
		document.addEventListener('mouseleave', onMouseUp)

		return () => {
			document.removeEventListener('mousemove', onMouseMove)
			document.removeEventListener('mouseup', onMouseUp)
			document.removeEventListener('mouseleave', onMouseUp)
		}
	}, [isDragging, onMouseMove, onMouseUp])

	const visible = !isSwitchingScale
	const lineCount = useMemo(
		() => Math.ceil(containerWidth / LineSpacing) + Math.ceil(TimelineAnchorPadding / LineSpacing) * 2,
		[containerWidth],
	)

	const [dividers, setDividers] = useState(Array(lineCount).fill(0))
	const { smallGroupSize, mediumGroupSize, largeGroupSize } = getTimelineMultipliers()

	const lastLineCount = useRef(0)
	const lastCalendar = useRef(calendar)
	const lastContainerWidth = useRef(containerWidth)
	const lastScaleLevel = useRef(scaleLevel)
	useEffect(() => {
		if (
			lineCount !== lastLineCount.current ||
			calendar !== lastCalendar.current ||
			containerWidth !== lastContainerWidth.current ||
			scaleLevel !== lastScaleLevel.current
		) {
			lastLineCount.current = lineCount
			lastCalendar.current = calendar
			lastContainerWidth.current = containerWidth
			lastScaleLevel.current = scaleLevel
			setDividers(Array(lineCount).fill(0))
		}
	}, [calendar, lineCount, containerWidth, scaleLevel])

	return (
		<Box
			ref={containerRef}
			onMouseDown={onMouseDown}
			onWheel={onWheel}
			sx={{
				position: 'absolute',
				width: '100%',
				height: '64px',
				background: theme.custom.palette.background.timelineHeader,
				cursor: isDragging ? 'grabbing' : 'grab',
				userSelect: 'none',
			}}
		>
			<Divider sx={{ width: '100%', position: 'absolute', bottom: '64px' }} />
			<Paper
				sx={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '32px',
					borderRadius: 0,
				}}
			/>
			<Fade in={visible} appear timeout={300}>
				<Box>
					<TimelineAnchorLabel />
					<TimelineAnchorContainer>
						{/* {dividers.map((_, index) => (
							<TimelineAnchorLine
								key={`${index}`}
								theme={theme}
								index={index}
								lineCount={lineCount}
								scaleLevel={scaleLevel}
								smallGroupSize={smallGroupSize}
								mediumGroupSize={mediumGroupSize}
								largeGroupSize={largeGroupSize}
								scaledTimeToRealTime={scaledTimeToRealTime}
								containerWidth={containerWidth}
							/>
						))} */}
					</TimelineAnchorContainer>
				</Box>
			</Fade>
		</Box>
	)
}
