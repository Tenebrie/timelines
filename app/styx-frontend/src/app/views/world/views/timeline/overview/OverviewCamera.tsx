import Box from '@mui/material/Box'
import { memo, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useEventBusDispatch, useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineLevelScalar } from '@/app/features/time/hooks/useTimelineLevelScalar'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../utils/TimelineState'

type Props = {
	minTime: number
	maxTime: number
	overviewWidth: number
}

export const OverviewCamera = memo(OverviewCameraComponent)

function OverviewCameraComponent({ minTime, maxTime, overviewWidth }: Props) {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { getLevelScalar } = useTimelineLevelScalar()
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	const [leftPercent, setLeftPercent] = useState(0)
	const [widthPercent, setWidthPercent] = useState(0)
	const [isDraggingCamera, setIsDraggingCamera] = useState(false)
	const dragStartRef = useRef<{ mouseX: number; initialScroll: number } | null>(null)

	const updatePosition = useEvent((scroll: number, currentScaleLevel = scaleLevel) => {
		// Get the scalar for current zoom level (how many time units per pixel)
		const scalar = getLevelScalar(currentScaleLevel)
		const viewportWidth = TimelineState.width

		// Account for the 40-pixel scroll offset (legacy reasons)
		const adjustedScroll = scroll - 40

		// Calculate what time is at the left edge of the viewport
		const timeAtLeftEdge = -adjustedScroll * scalar

		// Calculate what time is at the right edge of the viewport
		const timeAtRightEdge = (viewportWidth - adjustedScroll) * scalar

		// Map these times to the overview coordinate system as percentages
		// Overview goes from minTime to maxTime
		const totalTimeRange = maxTime - minTime
		const leftPositionPercent = ((timeAtLeftEdge - minTime) / totalTimeRange) * 100
		const rightPositionPercent = ((timeAtRightEdge - minTime) / totalTimeRange) * 100

		setLeftPercent(leftPositionPercent)
		setWidthPercent(rightPositionPercent - leftPositionPercent)
	})

	const handleCameraMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) {
			return
		}

		setIsDraggingCamera(true)

		// Store the initial mouse position and current scroll
		dragStartRef.current = {
			mouseX: e.clientX,
			initialScroll: TimelineState.scroll,
		}

		e.preventDefault()
		e.stopPropagation()
	}

	useEffect(() => {
		if (!isDraggingCamera) return

		const handleMouseMove = (e: MouseEvent) => {
			if (!dragStartRef.current) return

			// Calculate how many pixels the mouse moved
			const deltaX = e.clientX - dragStartRef.current.mouseX

			// Convert overview pixels to time units
			const totalTimeRange = maxTime - minTime
			const timePerOverviewPixel = totalTimeRange / overviewWidth

			// Convert time units to timeline scroll pixels
			const scalar = getLevelScalar(scaleLevel)
			const deltaTime = deltaX * timePerOverviewPixel
			const deltaScroll = -deltaTime / scalar

			// Apply the delta to the initial scroll position
			const newScroll = dragStartRef.current.initialScroll + deltaScroll

			// Use scrollTimelineTo with rawScrollValue
			scrollTimelineTo({ rawScrollValue: newScroll, skipAnim: true })
		}

		const handleMouseUp = () => {
			setIsDraggingCamera(false)
			dragStartRef.current = null
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDraggingCamera, overviewWidth, minTime, maxTime, scaleLevel, getLevelScalar, scrollTimelineTo])

	useEffect(() => {
		updatePosition(TimelineState.scroll, scaleLevel)
	}, [scaleLevel, updatePosition, minTime, maxTime, overviewWidth])

	useEventBusSubscribe['timeline/onScroll']({
		callback: (scroll) => {
			updatePosition(scroll)
		},
	})
	useEventBusSubscribe['timeline/onResize']({
		callback: () => {
			requestIdleCallback(() => {
				updatePosition(TimelineState.scroll)
			})
		},
	})

	if (widthPercent <= 0 || isNaN(widthPercent)) {
		return null
	}

	return (
		<Box
			onMouseDown={handleCameraMouseDown}
			sx={{
				width: `calc(${widthPercent}% + 1px)`,
				height: '100%',
				position: 'absolute',
				top: 0,
				left: `calc(${leftPercent}% + 1px)`,
				background: 'rgba(255, 255, 255, 0.05)',
				cursor: isDraggingCamera ? 'grabbing' : 'grab',
				transition: 'background 0.2s',
				'[data-overview-container]:hover &': {
					background: 'rgba(255, 255, 255, 0.10)',
				},
				'&:hover': {
					background: 'rgba(255, 255, 255, 0.15) !important',
				},
			}}
		/>
	)
}
