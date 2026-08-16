import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import throttle from 'lodash.throttle'
import { CSSProperties, useEffect, useRef } from 'react'
import z from 'zod'

import usePersistentStateRef from '@/app/hooks/usePersistentStateRef'

import { MindmapContent } from './MindmapContent'
import { MindmapClickArea } from './workspace/MindmapClickArea'
import { MindmapHotkeys } from './workspace/MindmapHotkeys'

export function Mindmap() {
	const [state, setState] = usePersistentStateRef(
		'mindmap',
		z.object({
			position: z.object({
				x: z.number(),
				y: z.number(),
			}),
			scale: z.number().min(0),
		}),
		{
			position: { x: 0, y: 0 },
			scale: 1,
		},
		sessionStorage,
	)

	const gridSpacing = 64
	const dotSize = 2

	const variables = useRef({
		'--grid-offset-x': `${state.current.position.x}px`,
		'--grid-offset-y': `${state.current.position.y}px`,
		'--grid-scale': state.current.scale,
	} as CSSProperties)

	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = ref.current
		if (!element) {
			return
		}

		const mouseState = {
			isDragging: false,
			dragMode: 'select' as 'select' | 'pan',
			gridOffsetX: state.current.position.x,
			gridOffsetY: state.current.position.y,
			gridScale: state.current.scale,
			gridScaleRaw: state.current.scale,
			scaleAdjustmentPending: 0,

			deltaX: 0,
			deltaY: 0,
		}

		// Throttle the update to avoid excessive recalculations.
		const update = throttle(() => {
			variables.current = {
				'--grid-offset-x': `${mouseState.gridOffsetX}px`,
				'--grid-offset-y': `${mouseState.gridOffsetY}px`,
				'--grid-scale': mouseState.gridScale,
				'--transition-duration': `${mouseState.isDragging ? 0.0 : 0.1}s`,
			} as CSSProperties

			element.style.setProperty('--grid-offset-x', `${mouseState.gridOffsetX}px`)
			element.style.setProperty('--grid-offset-y', `${mouseState.gridOffsetY}px`)
			element.style.setProperty('--grid-scale', mouseState.gridScale.toString())
			element.style.setProperty('--transition-duration', `${mouseState.isDragging ? 0.0 : 0.1}s`)

			setState(() => ({
				position: {
					x: mouseState.gridOffsetX,
					y: mouseState.gridOffsetY,
				},
				scale: mouseState.gridScale,
			}))
		}, 4)
		update()

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button === 0) {
				mouseState.isDragging = true
				mouseState.dragMode = 'select'
			} else if (event.button === 2) {
				mouseState.isDragging = true
				mouseState.dragMode = 'pan'
			}
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (!mouseState.isDragging) {
				return
			}
			if (event.button === 0 && mouseState.dragMode === 'select') {
				mouseState.isDragging = false
			}
			if (event.button === 2 && mouseState.dragMode === 'pan') {
				mouseState.isDragging = false
			}
			update()
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isDragging) {
				return
			}

			if (mouseState.dragMode === 'pan') {
				mouseState.gridOffsetX += event.movementX
				mouseState.gridOffsetY += event.movementY
			}
			update()
		}

		const handleWheel = (event: WheelEvent) => {
			event.preventDefault()

			const rect = element.getBoundingClientRect()
			const centerX = rect.width / 2
			const centerY = rect.height / 2

			let newScaleRaw = mouseState.gridScaleRaw * (1 - event.deltaY / 800)
			newScaleRaw = Math.min(Math.max(0.25, newScaleRaw), 5)
			mouseState.gridScaleRaw = newScaleRaw

			const oldScale = mouseState.gridScale
			const newScale = newScaleRaw

			const scaleFactor = newScale / oldScale
			mouseState.gridOffsetX = centerX - scaleFactor * (centerX - mouseState.gridOffsetX)
			mouseState.gridOffsetY = centerY - scaleFactor * (centerY - mouseState.gridOffsetY)
			mouseState.gridScale = newScale
			update()
		}

		const handleContextMenu = (event: MouseEvent) => {
			event.preventDefault()
		}

		element.addEventListener('mousedown', handleMouseDown)
		element.addEventListener('wheel', handleWheel, { passive: false })
		element.addEventListener('contextmenu', handleContextMenu)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			element.removeEventListener('wheel', handleWheel)
			element.removeEventListener('contextmenu', handleContextMenu)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [ref, setState, state])

	const theme = useTheme()
	const dotColor = theme.palette.divider

	return (
		<Stack sx={{ width: '100%', height: '100%' }}>
			<Box
				ref={ref}
				data-testid="MindmapGrid"
				data-mindmap-grid
				style={variables.current}
				sx={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					overflow: 'hidden',
				}}
			>
				<MindmapClickArea />
				<Box
					sx={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
						backgroundPosition: 'var(--grid-offset-x) var(--grid-offset-y)',
						backgroundImage: `radial-gradient(circle, ${dotColor} calc(${dotSize}px * var(--grid-scale)), transparent calc(${dotSize}px * var(--grid-scale)))`,
						backgroundSize: `calc(${gridSpacing}px * var(--grid-scale)) calc(${gridSpacing}px * var(--grid-scale))`,
						transition:
							'background-position var(--transition-duration) ease-out, background-size var(--transition-duration) ease-out',
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
						zIndex: 2,
					}}
				>
					<MindmapContent />
				</Box>
			</Box>
			<MindmapHotkeys />
		</Stack>
	)
}
