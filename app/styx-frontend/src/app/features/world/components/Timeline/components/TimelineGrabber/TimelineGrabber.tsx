import { memo, useEffect, useRef, useState } from 'react'
import { MouseEvent as ReactMouseEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { useEffectOnce } from '../../../../../../utils/useEffectOnce'
import { preferencesSlice } from '../../../../../preferences/reducer'
import { getTimelinePreferences } from '../../../../../preferences/selectors'

const StyledDragger = styled.div`
	width: 100%;
	height: 4px;
	position: absolute;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ns-resize;
`

const TimelineGrabberComponent = () => {
	const isDraggingNow = useRef(false)
	const [mousePosition, setMousePosition] = useState(0)
	const mouseStartingPosition = useRef(0)

	const onMouseDown = (event: ReactMouseEvent) => {
		isDraggingNow.current = true
		mouseStartingPosition.current = event.clientY
		window.document.body.classList.add('cursor-resizing', 'mouse-busy')
	}

	useEffectOnce(() => {
		const onMouseUp = () => {
			isDraggingNow.current = false
			window.document.body.classList.remove('cursor-resizing', 'mouse-busy')
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

	const { containerHeight } = useSelector(getTimelinePreferences)
	const { setTimelineHeight } = preferencesSlice.actions
	const dispatch = useDispatch()

	const currentContainerHeight = useRef(containerHeight)

	useEffect(() => {
		currentContainerHeight.current = containerHeight
	}, [containerHeight])

	useEffect(() => {
		if (isDraggingNow.current && mousePosition !== 0) {
			setMousePosition(0)
			const safeValue = (() => {
				const value = currentContainerHeight.current - mousePosition + mouseStartingPosition.current
				if (value < 260) {
					return 260
				}
				if (value > 800) {
					return 800
				}
				return value
			})()
			dispatch(setTimelineHeight(safeValue))
			mouseStartingPosition.current = mousePosition
		}
	}, [dispatch, mousePosition, setTimelineHeight])

	return <StyledDragger onMouseDown={(event) => onMouseDown(event)}></StyledDragger>
}

export const TimelineGrabber = memo(TimelineGrabberComponent)
