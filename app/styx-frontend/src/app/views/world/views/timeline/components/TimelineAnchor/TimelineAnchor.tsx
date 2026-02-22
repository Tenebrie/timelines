import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { useTimelineAnchorDrag } from '../../hooks/useTimelineAnchorDrag'
import { useTimelineHorizontalScroll } from '../../hooks/useTimelineHorizontalScroll'
import { TimelineAnchorContainer } from './TimelineAnchorContainer'
import { TimelineAnchorLabel } from './TimelineAnchorLabel'
import { TimelineAnchorLineList } from './TimelineAnchorLineList'

export const TimelineAnchorPadding = 250 // pixels

type Props = {
	containerWidth: number
	showCurrentTime?: boolean
}

export const TimelineAnchor = memo(TimelineAnchorComponent)

function TimelineAnchorComponent({ containerWidth, showCurrentTime }: Props) {
	const theme = useCustomTheme()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { scaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) => a.scaleLevel === b.scaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)
	const { calendar } = useWorldTime()

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
		() => Math.ceil(containerWidth / LineSpacing) + Math.ceil(TimelineAnchorPadding / LineSpacing) * 2 + 1000,
		[containerWidth],
	)

	const [linesKey, setLinesKey] = useState(0)

	const lastLineCount = useRef(0)
	const lastCalendar = useRef(calendar)
	const lastContainerWidth = useRef(containerWidth)
	const lastScaleLevel = useRef(scaleLevel)
	useLayoutEffect(() => {
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
			setLinesKey((prevKey) => prevKey + 1)
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
				height: '96px',
				background: theme.custom.palette.background.timelineHeader,
				cursor: isDragging ? 'grabbing' : 'grab',
				userSelect: 'none',
			}}
		>
			<Divider sx={{ width: '100%', position: 'absolute', bottom: '96px' }} />
			<Paper
				sx={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '64px',
					borderRadius: 0,
				}}
			/>
			<Divider sx={{ width: '100%', position: 'absolute', bottom: '32px' }} />
			<Fade in={visible} appear timeout={300}>
				<Box>
					{showCurrentTime && <TimelineAnchorLabel />}
					<TimelineAnchorContainer>
						<TimelineAnchorLineList key={linesKey} containerWidth={containerWidth} />
					</TimelineAnchorContainer>
				</Box>
			</Fade>
		</Box>
	)
}
