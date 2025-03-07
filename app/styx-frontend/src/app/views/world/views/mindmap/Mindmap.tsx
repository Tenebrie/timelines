import Construction from '@mui/icons-material/Construction'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import throttle from 'lodash.throttle'
import { CSSProperties, useEffect, useRef } from 'react'

import { MindmapContent } from './MindmapContent'
import { MindmapClickArea } from './workspace/MindmapClickArea'

export function Mindmap() {
	// Small grid: the base grid
	const smallGridSpacing = 32
	const smallLineThickness = 1

	// Medium grid: every 4 small grids
	const mediumGridSpacing = smallGridSpacing * 4 // 128px
	const mediumLineThickness = 2

	// Large grid: every 4 medium grids
	const largeGridSpacing = mediumGridSpacing * 4 // 512px
	const largeLineThickness = 3

	// Initialize CSS variables
	const variables = useRef({
		'--grid-offset-x': `0px`,
		'--grid-offset-y': `0px`,
		'--grid-scale': 1,
		'--small-grid-spacing': `${smallGridSpacing}px`,
		'--medium-grid-spacing': `${mediumGridSpacing}px`,
		'--large-grid-spacing': `${largeGridSpacing}px`,
	} as CSSProperties)

	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = ref.current
		if (!element) {
			return
		}

		const mouseState = {
			isDragging: false,
			gridOffsetX: 0,
			gridOffsetY: 0,
			gridScale: 1,
			scaleAdjustmentPending: 0,
		}

		// Throttle the update to avoid excessive recalculations.
		const update = throttle(() => {
			// Compute effective grid spacings as whole numbers.
			const effectiveSmallSpacing = Math.round(smallGridSpacing * mouseState.gridScale)
			const effectiveMediumSpacing = effectiveSmallSpacing * 4
			const effectiveLargeSpacing = effectiveMediumSpacing * 4

			variables.current = {
				'--grid-offset-x': `${mouseState.gridOffsetX}px`,
				'--grid-offset-y': `${mouseState.gridOffsetY}px`,
				'--grid-scale': mouseState.gridScale,
				'--small-grid-spacing': `${effectiveSmallSpacing}px`,
				'--medium-grid-spacing': `${effectiveMediumSpacing}px`,
				'--large-grid-spacing': `${effectiveLargeSpacing}px`,
			} as CSSProperties

			// Update the element's CSS variables.
			element.style.setProperty('--grid-offset-x', `${mouseState.gridOffsetX}px`)
			element.style.setProperty('--grid-offset-y', `${mouseState.gridOffsetY}px`)
			element.style.setProperty('--grid-scale', mouseState.gridScale.toString())
			element.style.setProperty('--small-grid-spacing', `${effectiveSmallSpacing}px`)
			element.style.setProperty('--medium-grid-spacing', `${effectiveMediumSpacing}px`)
			element.style.setProperty('--large-grid-spacing', `${effectiveLargeSpacing}px`)
		}, 4)

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button !== 0) return
			mouseState.isDragging = true
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0) return
			mouseState.isDragging = false
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isDragging) return
			mouseState.gridOffsetX += event.movementX
			mouseState.gridOffsetY += event.movementY
			update()
		}

		const handleWheel = (event: WheelEvent) => {
			event.preventDefault()

			const rect = element.getBoundingClientRect()
			const centerX = rect.width / 2
			const centerY = rect.height / 2

			const oldScale = mouseState.gridScale
			let newScale = oldScale * (1 - event.deltaY / 1000)
			newScale = Math.min(Math.max(0.15, newScale), 10)

			const scaleFactor = Math.round(smallGridSpacing * newScale) / Math.round(smallGridSpacing * oldScale)
			mouseState.gridOffsetX = centerX - scaleFactor * (centerX - mouseState.gridOffsetX)
			mouseState.gridOffsetY = centerY - scaleFactor * (centerY - mouseState.gridOffsetY)
			mouseState.gridScale *= scaleFactor
			update()
		}

		element.addEventListener('mousedown', handleMouseDown)
		element.addEventListener('wheel', handleWheel, { passive: false })
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			element.removeEventListener('wheel', handleWheel)
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [largeGridSpacing, mediumGridSpacing, ref])

	return (
		<Stack sx={{ width: '100%', height: '100%' }}>
			<Box
				ref={ref}
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
						opacity: 0.2,
						pointerEvents: 'none',
						backgroundPosition: 'var(--grid-offset-x) var(--grid-offset-y)',
						backgroundImage: `
							/* Large grid lines */
							linear-gradient(to right, rgba(0, 0, 0, 1) ${largeLineThickness}px, transparent ${largeLineThickness}px),
							linear-gradient(to bottom, rgba(0, 0, 0, 1) ${largeLineThickness}px, transparent ${largeLineThickness}px),
							/* Medium grid lines */
							linear-gradient(to right, rgba(0, 0, 0, 1) ${mediumLineThickness}px, transparent ${mediumLineThickness}px),
							linear-gradient(to bottom, rgba(0, 0, 0, 1) ${mediumLineThickness}px, transparent ${mediumLineThickness}px),
							/* Small grid lines */
							linear-gradient(to right, rgba(0, 0, 0, 1) ${smallLineThickness}px, transparent ${smallLineThickness}px),
							linear-gradient(to bottom, rgba(0, 0, 0, 1) ${smallLineThickness}px, transparent ${smallLineThickness}px)
						`,
						backgroundSize: `
							var(--large-grid-spacing) var(--large-grid-spacing),
							var(--large-grid-spacing) var(--large-grid-spacing),
							var(--medium-grid-spacing) var(--medium-grid-spacing),
							var(--medium-grid-spacing) var(--medium-grid-spacing),
							var(--small-grid-spacing) var(--small-grid-spacing),
							var(--small-grid-spacing) var(--small-grid-spacing)
						`,
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						left: 'var(--grid-offset-x)',
						top: 'var(--grid-offset-y)',
						pointerEvents: 'none',
						zIndex: 2,
					}}
				>
					<MindmapContent />
				</Box>
			</Box>
			<Stack
				sx={{
					width: '100%',
					height: '100%',
					alignItems: 'center',
					justifyContent: 'center',
					userSelect: 'none',
					pointerEvents: 'none',
					zIndex: 1,
				}}
			>
				<Typography variant="h3" component={'div'} sx={{ opacity: 0.05 }}>
					<Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
						<Box sx={{ marginTop: 1.5 }}>
							<Construction fontSize="inherit" />
						</Box>
						Under construction
					</Stack>
				</Typography>
			</Stack>
		</Stack>
	)
}
