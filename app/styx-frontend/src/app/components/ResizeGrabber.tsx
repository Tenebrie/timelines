import throttle from 'lodash.throttle'
import { memo, useEffect, useRef, useState } from 'react'
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
	const [key, setKey] = useState(0)
	const [visible, setVisible] = useState(true)
	const [_displayedHeight, _setDisplayedHeight] = useState(defaultHeight ?? 300)

	const setHeight = (value: number) => {
		_setDisplayedHeight(value)
		setKey((prev) => prev + 1)
	}

	useEventBusSubscribe({
		event: openOnEvent,
		callback: () => {
			if (!visible) {
				setVisible(true)
			}
		},
	})

	return {
		key,
		height: _displayedHeight,
		setHeight,
		_minHeight: minHeight ?? 64,
		_displayedHeight,
		_setDisplayedHeight,
		visible,
		setVisible,
	}
}

type Props = ReturnType<typeof useResizeGrabber> & {
	active: boolean
}

export const ResizeGrabber = memo(ResizeGrabberComponent)

function ResizeGrabberComponent({
	_displayedHeight,
	_setDisplayedHeight,
	_minHeight,
	active,
	visible,
	setVisible,
}: Props) {
	const isDraggingNow = useRef(false)
	const [mousePosition, setMousePosition] = useState(0)
	const mouseStartingPosition = useRef(0)

	const visibleRef = useAutoRef(visible)
	const [internalHeight, setInternalHeight] = useState(_displayedHeight)
	const currentContainerHeight = useAutoRef(internalHeight)

	const onMouseDown = (event: ReactMouseEvent) => {
		isDraggingNow.current = true
		mouseStartingPosition.current = event.clientY
		window.document.body.classList.add('cursor-resizing', 'mouse-busy')
	}

	const { triggerClick } = useDoubleClick({
		onClick: () => {},
		onDoubleClick: () => {
			if (visible) {
				setVisible(false)
			}
		},
	})

	const onMouseMove = useRef(
		throttle((event: MouseEvent) => {
			if (isDraggingNow.current) {
				setMousePosition(event.clientY)
			}
		}, 4),
	)

	useEffect(() => {
		const onMouseClick = (event: MouseEvent) => {
			triggerClick(event, {})
		}
		const onMouseUp = () => {
			if (isDraggingNow.current) {
				isDraggingNow.current = false
				if (currentContainerHeight.current <= _minHeight) {
					setInternalHeight(_minHeight)
				}
				setTimeout(() => {
					window.document.body.classList.remove('cursor-resizing', 'mouse-busy')
				}, 1)
			}
		}

		const onMove = onMouseMove.current

		window.addEventListener('click', onMouseClick)
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', onMove)

		return () => {
			window.removeEventListener('click', onMouseClick)
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', onMove)
		}
	}, [_minHeight, currentContainerHeight, triggerClick])

	// const { containerHeight } = useSelector(getTimelinePreferences)
	// const { setTimelineHeight } = preferencesSlice.actions
	// const dispatch = useDispatch()

	useEffect(() => {
		if (isDraggingNow.current && mousePosition !== 0) {
			setMousePosition(0)
			const value = currentContainerHeight.current + mousePosition - mouseStartingPosition.current
			setInternalHeight(value)

			const safeValue = (() => {
				if (value < _minHeight) {
					return _minHeight
				}
				return value
			})()
			_setDisplayedHeight(safeValue)
			const newVisible = safeValue > _minHeight
			if (newVisible !== visibleRef.current) {
				setVisible(newVisible)
			}
			mouseStartingPosition.current = mousePosition
		}
	}, [mousePosition, _setDisplayedHeight, _minHeight, currentContainerHeight, setVisible, visibleRef])

	return (
		<StyledDragger
			style={{
				opacity: active ? 1 : 0,
				pointerEvents: active ? 'auto' : 'none',
				transition: 'opacity 0.3s',
			}}
			onMouseDown={(event) => onMouseDown(event)}
		>
			<StyledInnerDragger></StyledInnerDragger>
		</StyledDragger>
	)
}
