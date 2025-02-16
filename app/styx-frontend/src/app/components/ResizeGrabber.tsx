import Box from '@mui/material/Box'
import { ReactNode } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { MouseEvent as ReactMouseEvent } from 'react'
import styled from 'styled-components'

import { useEventBusSubscribe } from '../features/eventBus'
import { AllowedEvents } from '../features/eventBus/types'
import { useAutoRef } from '../hooks/useAutoRef'
import { useDoubleClick } from '../hooks/useDoubleClick'

const StyledInnerDragger = styled.div`
	width: calc(100% - 32px);
	max-width: 96px;
	height: 4px;
	background: rgba(0, 0, 0, 0.4);
	border-radius: 2px;
`

const StyledInnerDraggerHorizontal = styled.div`
	height: calc(100% - 32px);
	max-height: 96px;
	width: 4px;
	background: rgba(0, 0, 0, 0.4);
	border-radius: 2px;
`

type TopProps = {
	minHeight?: number
	defaultHeight?: number
	openOnEvent?: AllowedEvents
}

export function useResizeGrabber({ minHeight, defaultHeight, openOnEvent }: TopProps = {}) {
	const isDraggingNow = useRef(false)
	const [isDraggingChild, setIsDraggingChild] = useState(false)
	const [visible, setVisibleInternal] = useState(true)
	const [overflowHeight, _setOverflowHeight] = useState(0)
	const [_displayedHeight, _setDisplayedHeight] = useState(defaultHeight ?? minHeight ?? 300)
	const [_internalHeight, _setInternalHeight] = useState(_displayedHeight)

	const setVisible = useCallback(
		(value: boolean) => {
			setVisibleInternal(value)
			if (value) {
				if (!isDraggingNow.current) {
					_setInternalHeight(Math.max(minHeight ?? 0, _internalHeight))
				} else {
					_setInternalHeight(0)
					_setOverflowHeight(-Math.max(minHeight ?? 0, _internalHeight))
				}
			} else {
				_setOverflowHeight(0)
			}
		},
		[_internalHeight, minHeight],
	)

	useEventBusSubscribe({
		event: openOnEvent,
		callback: () => {
			if (!visible) {
				setVisible(true)
			}
		},
	})

	return {
		height: _displayedHeight,
		isDraggingNow,
		_minHeight: minHeight ?? 0,
		visible,
		setVisible,
		isDraggingChild,
		setIsDraggingChild,
		overflowHeight,
		_setOverflowHeight,
		_internalHeight,
		_setInternalHeight,
		_displayedHeight,
		_setDisplayedHeight,
	}
}

type Props = ReturnType<typeof useResizeGrabber> & {
	active: boolean
	children?: ReactNode | ReactNode[]
}

export const ResizeGrabber = memo(ResizeGrabberComponent)

function ResizeGrabberComponent({
	isDraggingNow,
	_setDisplayedHeight,
	_minHeight,
	active,
	visible,
	setVisible,
	setIsDraggingChild,
	_internalHeight,
	_setInternalHeight,
	overflowHeight,
	_setOverflowHeight,
	children,
	position,
}: Props & { position: 'top' | 'left' | 'right' }) {
	const isClicking = useRef(false)
	const isVertical = position === 'top'
	const [mousePosition, setMousePosition] = useState(0)
	const mouseLastSeenPosition = useRef(0)
	const _currentContainerHeight = useAutoRef(_internalHeight)

	const visibleRef = useAutoRef(visible)

	const onMouseDown = (event: MouseEvent | ReactMouseEvent, isChild: boolean) => {
		isClicking.current = true
		setIsDraggingChild(isChild)
		const newMousePos = isVertical ? event.clientY : event.clientX
		mouseLastSeenPosition.current = newMousePos
		if (isVertical) {
			window.document.body.classList.add('cursor-resizing-ns', 'mouse-busy')
		} else {
			window.document.body.classList.add('cursor-resizing-ew', 'mouse-busy')
		}
	}

	const { triggerClick } = useDoubleClick({
		onClick: () => {},
		onDoubleClick: () => {
			setVisible(!visibleRef.current)
		},
	})

	// const onMouseClick = (event: ReactMouseEvent) => {
	// 	triggerClick(event, {})
	// }

	const onMouseMove = useRef(
		throttle((event: MouseEvent) => {
			const newMousePos = isVertical ? event.clientY : event.clientX
			if (
				isClicking.current &&
				!isDraggingNow.current &&
				Math.abs(newMousePos - mouseLastSeenPosition.current) > 4
			) {
				isDraggingNow.current = true
			}
			if (isDraggingNow.current) {
				setMousePosition(newMousePos)
			}
		}, 4),
	)

	useEffect(() => {
		const onMouseUp = (event: MouseEvent) => {
			if (!isClicking.current && !isDraggingNow.current) {
				return
			}
			if (isClicking.current && !isDraggingNow.current) {
				triggerClick(event, {})
			}
			isClicking.current = false
			setIsDraggingChild(false)
			setTimeout(() => {
				window.document.body.classList.remove('cursor-resizing-ns', 'cursor-resizing-ew', 'mouse-busy')
			}, 1)
			if (!isDraggingNow.current) {
				return
			}
			isDraggingNow.current = false
			if (_currentContainerHeight.current <= _minHeight) {
				setVisible(false)
			}
		}

		const onMove = onMouseMove.current

		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', onMove)

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', onMove)
		}
	}, [
		_minHeight,
		_setOverflowHeight,
		_currentContainerHeight,
		isDraggingNow,
		setIsDraggingChild,
		setVisible,
		triggerClick,
		isVertical,
	])

	// const { containerHeight } = useSelector(getTimelinePreferences)
	// const { setTimelineHeight } = preferencesSlice.actions
	// const dispatch = useDispatch()

	useEffect(() => {
		if (!isDraggingNow.current || mousePosition === 0) {
			return
		}
		setMousePosition(0)

		const value = (() => {
			if (position === 'top' || position === 'left') {
				return _currentContainerHeight.current + mousePosition - mouseLastSeenPosition.current
			} else {
				return _currentContainerHeight.current - mousePosition + mouseLastSeenPosition.current
			}
		})()
		_setInternalHeight(value)

		const constrainedValue = Math.max(_minHeight, value)
		_setDisplayedHeight(constrainedValue)

		if (overflowHeight !== value - constrainedValue) {
			_setOverflowHeight(value - constrainedValue)
		}
		mouseLastSeenPosition.current = mousePosition

		if (!visible) {
			setVisible(true)
		}
	}, [
		mousePosition,
		_setDisplayedHeight,
		_minHeight,
		_currentContainerHeight,
		setVisible,
		visibleRef,
		_setOverflowHeight,
		isDraggingNow,
		overflowHeight,
		visible,
		_setInternalHeight,
		isVertical,
		position,
	])

	return (
		<div
			style={{
				pointerEvents: 'none',
				zIndex: 1,
				height: isVertical ? 'unset' : '100%',
			}}
		>
			<Box
				onMouseDown={(event) => onMouseDown(event, false)}
				style={{
					opacity: active ? 1 : 0,
					pointerEvents: active ? 'auto' : 'none',
					transition: 'opacity 0.3s',
					position: 'relative',
				}}
				sx={{
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1,
					'&:hover > *': {
						background: 'rgba(0, 0, 0, 0.6)',
					},
					'&:active > *': {
						background: 'rgba(0, 0, 0, 0.8)',
					},
					...(position === 'top' && {
						width: '100%',
						height: '16px',
						marginTop: '-16px',
						borderRadius: '0 0 8px 8px',
						cursor: 'ns-resize',
					}),
					...(position === 'right' && {
						height: '100%',
						width: '16px',
						marginLeft: '-16px',
						borderRadius: '8px 0 0 8px',
						cursor: 'ew-resize',
					}),
					...(position === 'left' && {
						height: '100%',
						width: '16px',
						marginRight: '-16px',
						borderRadius: '0 8px 8px 0',
						cursor: 'ew-resize',
					}),
				}}
			>
				{isVertical && <StyledInnerDragger></StyledInnerDragger>}
				{!isVertical && <StyledInnerDraggerHorizontal></StyledInnerDraggerHorizontal>}
			</Box>
			{children && (
				<div
					style={{
						cursor: 's-resize',
						pointerEvents: 'none',
					}}
					onMouseDown={(event) => onMouseDown(event, true)}
				>
					{children}
				</div>
			)}
		</div>
	)
}
