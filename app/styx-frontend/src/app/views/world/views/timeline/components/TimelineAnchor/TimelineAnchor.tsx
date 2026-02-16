import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { EsotericDate } from '@/app/features/time/calendar/date/EsotericDate'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { useTimelineAnchorDrag } from '../../hooks/useTimelineAnchorDrag'
import { useTimelineHorizontalScroll } from '../../hooks/useTimelineHorizontalScroll'
import { TimelineState } from '../../utils/TimelineState'
import { TimelineAnchorContainer } from './TimelineAnchorContainer'
import { TimelineAnchorLabel } from './TimelineAnchorLabel'
import { TimelineAnchorLine } from './TimelineAnchorLine'
import { useStaggeredValue } from './useStaggeredValue'

export const TimelineAnchorPadding = 150 // pixels

type Props = {
	containerWidth: number
}

export const TimelineAnchor = memo(TimelineAnchorComponent)

function TimelineAnchorComponent({ containerWidth }: Props) {
	const theme = useCustomTheme()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)
	const worldCalendar = calendars[0]
	const { scaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) => a.scaleLevel === b.scaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

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
		() => Math.ceil(containerWidth / LineSpacing) + Math.ceil(TimelineAnchorPadding / LineSpacing) * 2 + 700,
		[containerWidth],
	)

	type DividerData = {
		timestamp: number
		size: 'large' | 'medium' | 'small'
		formatString: string
	}

	const [dividers, setDividers] = useState<DividerData[]>([])
	const { presentation } = useWorldTime()

	const [staggeredScroll, setStaggeredScroll, forceSetStaggeredScroll] = useStaggeredValue({
		value: TimelineState.scroll,
		stagger: 500,
	})

	useEventBusSubscribe['timeline/onScroll']({
		callback: (scroll) => {
			if (!presentation.baselineUnit) {
				throw new Error('No baseline')
			}
			setStaggeredScroll(scroll)
		},
	})

	const regenerateDividers = useCallback(
		(scroll: number) => {
			if (presentation.units.length === 0) {
				return
			}

			const currentTimestamp = scaledTimeToRealTime(-scroll + 40)
			let baseDate = new EsotericDate(worldCalendar, currentTimestamp).floor(presentation.units[0].unit)
			const valueToStep = baseDate.get(presentation.units[0].unit)!.value % presentation.units[0].subdivision
			baseDate = baseDate.step(presentation.units[0].unit, -valueToStep)

			const dividers: DividerData[] = []
			presentation.units.forEach((presentationUnit, outerIndex) => {
				const labelSize = (() => {
					if (outerIndex === 0) {
						return 'large'
					} else if (outerIndex === 1) {
						return 'medium'
					} else {
						return 'small'
					}
				})()

				let date = new EsotericDate(baseDate)

				for (let i = 0; i < lineCount; i++) {
					const timestamp = date.getTimestamp()
					const screenLeft = scaledTimeToRealTime(-TimelineState.scroll - 500)
					const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + 1000)
					if (timestamp < screenLeft || timestamp > screenRight) {
						date = date.step(presentationUnit.unit, presentationUnit.subdivision)
						continue
					}

					const matchesIndices = (() => {
						if (presentationUnit.labeledIndices.length === 0) {
							return true
						}
						const parsed = new EsotericDate(worldCalendar, timestamp)
						return presentationUnit.labeledIndices.includes(parsed.get(presentationUnit.unit)!.value)
					})()

					if (matchesIndices && !dividers.some((d) => d.timestamp === timestamp)) {
						dividers.push({
							timestamp,
							size: labelSize,
							formatString: presentationUnit.formatString,
						})
					}
					date = date.step(presentationUnit.unit, presentationUnit.subdivision)
				}
			})
			setDividers(dividers)
		},
		[containerWidth, lineCount, presentation.units, scaledTimeToRealTime, worldCalendar],
	)

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
			// forceSetRenderedTimestamp(TimelineState.scroll)
		}
	}, [calendar, lineCount, containerWidth, scaleLevel, forceSetStaggeredScroll])

	useEffect(() => {
		regenerateDividers(staggeredScroll)
	}, [regenerateDividers, staggeredScroll])

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
						{dividers.map((div) => (
							<TimelineAnchorLine
								key={`${div.timestamp}`}
								theme={theme}
								containerWidth={containerWidth}
								{...div}
							/>
						))}
					</TimelineAnchorContainer>
				</Box>
			</Fade>
		</Box>
	)
}
