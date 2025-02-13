import { memo, useEffect, useRef, useState } from 'react'
import { MouseEvent as ReactMouseEvent } from 'react'
import styled from 'styled-components'

import { useEffectOnce } from '@/app/utils/useEffectOnce'

const StyledDragger = styled.div`
	width: calc(100%);
	height: 8px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ns-resize;
	margin-top: -4px;
	pointer-events: auto;
	z-index: 1;
`
type TopProps = {
	defaultHeight?: number
}

export function useResizeGrabber({ defaultHeight }: TopProps) {
	const [key, setKey] = useState(0)
	const [_displayedHeight, _setDisplayedHeight] = useState(defaultHeight ?? 300)

	const setHeight = (value: number) => {
		_setDisplayedHeight(value)
		setKey((prev) => prev + 1)
	}

	return {
		key,
		height: _displayedHeight,
		setHeight,
		_displayedHeight,
		_setDisplayedHeight,
	}
}

type Props = ReturnType<typeof useResizeGrabber>

export const ResizeGrabber = memo(ResizeGrabberComponent)

function ResizeGrabberComponent({ _displayedHeight, _setDisplayedHeight }: Props) {
	const isDraggingNow = useRef(false)
	const [mousePosition, setMousePosition] = useState(0)
	const mouseStartingPosition = useRef(0)

	const [internalHeight, setInternalHeight] = useState(_displayedHeight)

	const onMouseDown = (event: ReactMouseEvent) => {
		isDraggingNow.current = true
		mouseStartingPosition.current = event.clientY
		window.document.body.classList.add('cursor-resizing', 'mouse-busy')
	}

	useEffectOnce(() => {
		const onMouseUp = () => {
			if (isDraggingNow.current) {
				isDraggingNow.current = false
				setTimeout(() => {
					window.document.body.classList.remove('cursor-resizing', 'mouse-busy')
				}, 1)
			}
		}
		const onMouseMove = (event: MouseEvent) => {
			if (isDraggingNow.current) {
				setMousePosition(event.clientY)
			}
		}

		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', onMouseMove)

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', onMouseUp)
		}
	})

	// const { containerHeight } = useSelector(getTimelinePreferences)
	// const { setTimelineHeight } = preferencesSlice.actions
	// const dispatch = useDispatch()

	const currentContainerHeight = useRef(internalHeight)

	useEffect(() => {
		currentContainerHeight.current = internalHeight
	}, [internalHeight])

	useEffect(() => {
		if (isDraggingNow.current && mousePosition !== 0) {
			setMousePosition(0)
			const value = currentContainerHeight.current + mousePosition - mouseStartingPosition.current
			setInternalHeight(value)

			const safeValue = (() => {
				if (value < 20) {
					return 0
				}
				return value
			})()
			_setDisplayedHeight(safeValue)
			mouseStartingPosition.current = mousePosition
		}
	}, [mousePosition, _setDisplayedHeight])

	return <StyledDragger onMouseDown={(event) => onMouseDown(event)}></StyledDragger>
}
