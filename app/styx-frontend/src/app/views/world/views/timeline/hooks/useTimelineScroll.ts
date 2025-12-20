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
	const overscrollRef = useRef(0)
	const [overscroll, setOverscroll] = useState(0)
	const draggingFrom = useRef<Position | null>(null)
	const mousePos = useRef<Position>({ x: 0, y: 0 })
	const isDraggingRef = useRef(false)
	const [isDragging, setDragging] = useState(false)
	const [canClick, setCanClick] = useState(true)

	const boundingRectTop = useRef(0)
	const boundingRectLeft = useRef(0)

	const lastScroll = useRef<number | null>(null)
	const notifyTimelineScrolled = useNotifyTimelineScrolled()

	const setScroll = useCallback(
		(scroll: number) => {
			const publicScroll = Math.round(scroll + Math.pow(Math.abs(overscroll), 0.85) * Math.sign(overscroll))

			if (publicScroll === lastScroll.current) {
				return
			}
			lastScroll.current = publicScroll - 40
			TimelineState.scroll = publicScroll - 40
			TimelineState.scaleLevel = scaleLevel
			notifyTimelineScrolled(publicScroll)
		},
		[notifyTimelineScrolled, overscroll, scaleLevel],
	)

	const onMouseDown = useCallback((event: MouseEvent | TouchEvent) => {
		if (event.shiftKey || event.ctrlKey || event.metaKey) {
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
		setCanClick(true)
		mousePos.current = newPos
		draggingFrom.current = newPos
	}, [])

	const onMouseUp = useCallback(() => {
		setDragging(false)
		draggingFrom.current = null
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
					setCanClick(false)
				}
			}

			if (isDraggingRef.current) {
				const newScroll = scrollRef.current + newPos.x - mousePos.current.x + overscrollRef.current
				let targetOverscroll = 0
				if (isFinite(minimumScroll) && newScroll < minimumScroll) {
					scrollRef.current = minimumScroll
					targetOverscroll = newScroll - minimumScroll
				} else if (isFinite(maximumScroll) && newScroll > maximumScroll) {
					scrollRef.current = maximumScroll
					targetOverscroll = newScroll - maximumScroll
				} else {
					scrollRef.current = newScroll
					targetOverscroll = 0
				}

				if (overscrollRef.current !== targetOverscroll) {
					setOverscroll(targetOverscroll)
				}
				setScroll(scrollRef.current)
				mousePos.current = newPos
			}
		},
	)

	useEffect(() => {
		overscrollRef.current = overscroll
	}, [overscroll])

	useEffect(() => {
		isDraggingRef.current = isDragging
		if (isDragging) {
			return
		}
		const interval = window.setInterval(() => {
			setOverscroll((overscroll) => overscroll * 0.9)
		}, 1)
		return () => window.clearInterval(interval)
	}, [isDragging])

	return {
		scrollRef,
		canClick,
		setScroll,
		onMouseDown,
		onMouseUp,
		onMouseMoveThrottled,
		minimumScroll,
		maximumScroll,
	}
}
