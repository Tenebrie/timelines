import { useCallback, useEffect, useRef, useState } from 'react'

import { ScaleLevel } from '@/app/schema/ScaleLevel'

import { checkIfClickBlocked } from '../utils/checkIfClickBlocked'
import { Position } from '../utils/Position'
import { TimelineState } from '../utils/TimelineState'
import { useNotifyTimelineScrolled } from './useNotifyTimelineScrolled'

type Props = {
	defaultScroll: number
	scaleLevel: ScaleLevel
	minimumScroll: number
	maximumScroll: number
}

export const useTimelineScroll = ({ defaultScroll, scaleLevel, minimumScroll, maximumScroll }: Props) => {
	const scrollRef = useRef(defaultScroll)
	const draggingFrom = useRef<Position | null>(null)
	const mousePos = useRef<Position>({ x: 0, y: 0 })
	const isDraggingRef = useRef(false)
	const [isDragging, setDragging] = useState(false)

	const boundingRectTop = useRef(0)
	const boundingRectLeft = useRef(0)

	const lastScroll = useRef<number | null>(null)
	const notifyTimelineScrolled = useNotifyTimelineScrolled()

	const setScroll = useCallback(
		(scroll: number) => {
			const publicScroll = Math.round(scroll)

			if (publicScroll === lastScroll.current) {
				return
			}
			lastScroll.current = publicScroll
			TimelineState.scroll = publicScroll
			TimelineState.scaleLevel = scaleLevel
			notifyTimelineScrolled(publicScroll)
		},
		[notifyTimelineScrolled, scaleLevel],
	)

	const onMouseDown = useCallback((event: MouseEvent | TouchEvent) => {
		if (event.shiftKey || event.ctrlKey || event.metaKey) {
			return
		}
		// Only handle right-click (button 2) for dragging
		if ('button' in event && event.button !== 2) {
			return
		}
		if (checkIfClickBlocked(event.target)) {
			return
		}
		const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
		const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
		const boundingRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
		boundingRectTop.current = boundingRect.top
		boundingRectLeft.current = boundingRect.left
		const newPos = { x: clientX - boundingRectLeft.current, y: clientY - boundingRectTop.current }
		// setCanClick(true)
		TimelineState.canOpenContextMenu = true
		mousePos.current = newPos
		draggingFrom.current = newPos
	}, [])

	const onMouseUp = useCallback(() => {
		setDragging(false)
		draggingFrom.current = null
		TimelineState.canOpenContextMenu = true
	}, [])

	const onMouseMoveThrottled = useRef(
		(event: MouseEvent | TouchEvent, minimumScroll: number, maximumScroll: number) => {
			if (window.document.body.classList.contains('mouse-busy')) {
				return
			}

			const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
			const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
			const newPos = { x: clientX - boundingRectLeft.current, y: clientY - boundingRectTop.current }

			if (draggingFrom.current !== null && !isDraggingRef.current) {
				/* If the mouse moved less than N pixels, do not start dragging */
				/* Makes clicking feel more responsive with accidental mouse movements */
				const dist = Math.abs(newPos.x - draggingFrom.current.x)
				if (dist >= 5) {
					setDragging(true)
					// setCanClick(false)
					TimelineState.canOpenContextMenu = false
				}
			}

			if (isDraggingRef.current) {
				const newScroll = scrollRef.current + newPos.x - mousePos.current.x
				if (isFinite(minimumScroll) && newScroll < minimumScroll) {
					scrollRef.current = minimumScroll
				} else if (isFinite(maximumScroll) && newScroll > maximumScroll) {
					scrollRef.current = maximumScroll
				} else {
					scrollRef.current = newScroll
				}

				setScroll(scrollRef.current)
				mousePos.current = newPos
			}
		},
	)

	useEffect(() => {
		isDraggingRef.current = isDragging
		if (isDragging) {
			return
		}
	}, [isDragging])

	return {
		scrollRef,
		setScroll,
		onMouseDown,
		onMouseUp,
		onMouseMoveThrottled,
		minimumScroll,
		maximumScroll,
		isDraggingRef,
	}
}
