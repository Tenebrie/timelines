import Box from '@mui/material/Box'
import throttle from 'lodash.throttle'
import { memo, ReactNode, startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { MouseEvent as ReactMouseEvent } from 'react'
import styled from 'styled-components'

import { useAutoRef } from '../../hooks/useAutoRef'
import { useDoubleClick } from '../../hooks/useDoubleClick'

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
	maxHeight?: number
	initialOpen?: boolean
	initialHeight?: number
	keepMounted?: boolean
}

export function useResizeGrabber({
	minHeight,
	maxHeight,
	initialOpen,
	initialHeight,
	keepMounted,
}: TopProps = {}) {
	const _isDraggingNow = useRef(false)
	const [isDragging, _setIsDragging] = useState(false)
	const [isDraggingChild, setIsDraggingChild] = useState(false)
	const [drawerVisible, setDrawerVisible] = useState(initialOpen ?? true)
	const [overflowHeight, _setOverflowHeight] = useState(0)
	const [_displayedHeight, _setDisplayedHeight] = useState(initialHeight ?? minHeight ?? 300)
	const [_internalHeight, _setInternalHeight] = useState(_displayedHeight)
	const [preferredOpen, setPreferredOpen] = useState(initialOpen ?? true)

	const [contentVisible, setContentVisible] = useState((initialOpen ?? true) || (keepMounted ?? false))
	const animationRef = useRef<number | null>(null)

	useEffect(() => {
		if (keepMounted) {
			return
		}
		if (animationRef.current) {
			window.clearTimeout(animationRef.current)
		}
		if (!drawerVisible) {
			animationRef.current = window.setTimeout(() => {
				startTransition(() => {
					setContentVisible(false)
				})
			}, 300)
		} else {
			startTransition(() => {
				setContentVisible(true)
			})
		}
	}, [drawerVisible, keepMounted])

	const _setVisibleInternal = useCallback(
		(value: boolean, updatePreferred: boolean) => {
			setDrawerVisible(value)
			if (value) {
				if (!_isDraggingNow.current) {
					_setInternalHeight(Math.max(minHeight ?? 0, _internalHeight))
				} else {
					_setInternalHeight(0)
					_setOverflowHeight(-Math.max(minHeight ?? 0, _internalHeight))
				}
			} else {
				_setOverflowHeight(0)
			}
			if (updatePreferred) {
				setPreferredOpen(value)
			}
		},
		[_internalHeight, minHeight],
	)

	const setVisible = useCallback(
		(value: boolean) => {
			_setVisibleInternal(value, false)
		},
		[_setVisibleInternal],
	)

	const setHeight = useCallback(
		(value: number) => {
			_setDisplayedHeight(value)
			_setInternalHeight(value)
		},
		[_setDisplayedHeight, _setInternalHeight],
	)

	return {
		height: _displayedHeight,
		_isDraggingNow,
		_minHeight: minHeight ?? 0,
		_maxHeight: maxHeight ?? window.innerHeight - 256,
		drawerVisible,
		preferredOpen,
		setVisible,
		_setVisibleInternal,
		setHeight,
		contentVisible: contentVisible ?? keepMounted,
		isDragging,
		_setIsDragging,
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
	_isDraggingNow,
	_setIsDragging,
	_setDisplayedHeight,
	_minHeight,
	_maxHeight,
	active,
	drawerVisible,
	_setVisibleInternal,
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

	const drawerVisibleRef = useAutoRef(drawerVisible)

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
			_setVisibleInternal(!drawerVisibleRef.current, true)
		},
	})

	const onMouseMove = useRef(
		throttle((event: MouseEvent) => {
			const newMousePos = isVertical ? event.clientY : event.clientX
			if (
				isClicking.current &&
				!_isDraggingNow.current &&
				Math.abs(newMousePos - mouseLastSeenPosition.current) > 4
			) {
				_isDraggingNow.current = true
				_setIsDragging(true)
			}
			if (_isDraggingNow.current) {
				setMousePosition(newMousePos)
			}
		}, 4),
	)

	useEffect(() => {
		const onMouseUp = (event: MouseEvent) => {
			if (!isClicking.current && !_isDraggingNow.current) {
				return
			}
			if (isClicking.current && !_isDraggingNow.current) {
				triggerClick(event, {})
			}
			isClicking.current = false
			setIsDraggingChild(false)
			setTimeout(() => {
				window.document.body.classList.remove('cursor-resizing-ns', 'cursor-resizing-ew', 'mouse-busy')
			}, 1)
			if (!_isDraggingNow.current) {
				return
			}
			_isDraggingNow.current = false
			_setIsDragging(false)
			if (_currentContainerHeight.current < _minHeight) {
				_setVisibleInternal(false, true)
			}
			if (_currentContainerHeight.current > _maxHeight) {
				_setInternalHeight(_maxHeight)
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
		_isDraggingNow,
		setIsDraggingChild,
		_setVisibleInternal,
		triggerClick,
		isVertical,
		_setIsDragging,
		_maxHeight,
		_setInternalHeight,
	])

	useEffect(() => {
		if (!_isDraggingNow.current || mousePosition === 0) {
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

		const constrainedValue = Math.min(_maxHeight, Math.max(_minHeight, value))
		_setDisplayedHeight(constrainedValue)

		if (overflowHeight !== value - constrainedValue) {
			_setOverflowHeight(Math.min(0, value - constrainedValue))
		}
		mouseLastSeenPosition.current = mousePosition

		if (!drawerVisible) {
			_setVisibleInternal(true, true)
		}
	}, [
		mousePosition,
		_setDisplayedHeight,
		_minHeight,
		_currentContainerHeight,
		_setVisibleInternal,
		drawerVisibleRef,
		_setOverflowHeight,
		_isDraggingNow,
		overflowHeight,
		drawerVisible,
		_setInternalHeight,
		isVertical,
		position,
		_maxHeight,
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
					// TODO: Optimize selector
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
