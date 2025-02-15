import { ReactNode } from '@tanstack/react-router'
import throttle from 'lodash.throttle'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { MouseEvent as ReactMouseEvent } from 'react'
import styled from 'styled-components'

import { useEventBusSubscribe } from '../features/eventBus'
import { AllowedEvents } from '../features/eventBus/types'
import { useAutoRef } from '../hooks/useAutoRef'
import { useDoubleClick } from '../hooks/useDoubleClick'

const StyledDragger = styled.div`
	width: calc(100%);
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ns-resize;
	height: 16px;
	margin-top: -16px;
	pointer-events: auto;
	border-radius: 0 0 8px 8px;
	z-index: 1;
	&:hover > * {
		background: rgba(0, 0, 0, 0.6);
	}
	&:active > * {
		background: rgba(0, 0, 0, 0.8);
	}
`
const StyledInnerDragger = styled.div`
	width: calc(100% - 32px);
	max-width: 96px;
	height: 4px;
	background: rgba(0, 0, 0, 0.4);
	border-radius: 2px;
`

type TopProps = {
	minHeight?: number
	defaultHeight?: number
	openOnEvent?: AllowedEvents
}

export function useResizeGrabber({ minHeight, defaultHeight, openOnEvent }: TopProps) {
	const isDraggingNow = useRef(false)
	const [isDraggingChild, setIsDraggingChild] = useState(false)
	const [visible, setVisibleInternal] = useState(true)
	const [overflowHeight, _setOverflowHeight] = useState(0)
	const [_displayedHeight, _setDisplayedHeight] = useState(defaultHeight ?? 300)
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
		_minHeight: minHeight ?? 64,
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
	children: ReactNode | ReactNode[]
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
}: Props) {
	const [mousePosition, setMousePosition] = useState(0)
	const mouseLastSeenPosition = useRef(0)
	const _currentContainerHeight = useAutoRef(_internalHeight)

	const visibleRef = useAutoRef(visible)

	const onMouseDown = (event: MouseEvent | ReactMouseEvent, isChild: boolean) => {
		isDraggingNow.current = true
		mouseLastSeenPosition.current = event.clientY
		window.document.body.classList.add('cursor-resizing', 'mouse-busy')
		setIsDraggingChild(isChild)
	}

	const { triggerClick } = useDoubleClick({
		onClick: () => {},
		onDoubleClick: () => {
			if (visible) {
				setVisible(false)
			}
		},
	})

	const onMouseClick = (event: ReactMouseEvent) => {
		triggerClick(event, {})
	}

	const onMouseMove = useRef(
		throttle((event: MouseEvent) => {
			if (isDraggingNow.current) {
				setMousePosition(event.clientY)
			}
		}, 4),
	)

	useEffect(() => {
		const onMouseUp = () => {
			if (!isDraggingNow.current) {
				return
			}
			isDraggingNow.current = false
			if (_currentContainerHeight.current <= _minHeight) {
				setVisible(false)
			}
			setIsDraggingChild(false)
			setTimeout(() => {
				window.document.body.classList.remove('cursor-resizing', 'mouse-busy')
			}, 1)
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
	])

	// const { containerHeight } = useSelector(getTimelinePreferences)
	// const { setTimelineHeight } = preferencesSlice.actions
	// const dispatch = useDispatch()

	useEffect(() => {
		if (!isDraggingNow.current || mousePosition === 0) {
			return
		}
		setMousePosition(0)

		const value = _currentContainerHeight.current + mousePosition - mouseLastSeenPosition.current
		_setInternalHeight(value)

		const constrainedValue = Math.max(_minHeight, value)
		_setDisplayedHeight(constrainedValue)

		if (overflowHeight !== value - constrainedValue) {
			_setOverflowHeight(value - constrainedValue)
		}
		mouseLastSeenPosition.current = mousePosition

		if (!visible) {
			setVisible(true)
			// _setOverflowHeight(_minHeight)
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
	])

	return (
		<div style={{ pointerEvents: 'none' }}>
			<StyledDragger
				onClick={onMouseClick}
				onMouseDown={(event) => onMouseDown(event, false)}
				style={{
					opacity: active ? 1 : 0,
					pointerEvents: active ? 'auto' : 'none',
					transition: 'opacity 0.3s',
					position: 'relative',
				}}
			>
				<StyledInnerDragger></StyledInnerDragger>
			</StyledDragger>
			<div
				onClick={onMouseClick}
				style={{
					cursor: 's-resize',
					pointerEvents: 'none',
				}}
				onMouseDown={(event) => onMouseDown(event, true)}
			>
				{children}
			</div>
		</div>
	)
}
