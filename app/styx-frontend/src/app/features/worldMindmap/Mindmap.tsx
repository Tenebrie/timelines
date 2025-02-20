import Construction from '@mui/icons-material/Construction'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import throttle from 'lodash.throttle'
import { CSSProperties, useEffect, useRef } from 'react'

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

	// Extra-large grid: every 4 large grids
	const xLargeGridSpacing = largeGridSpacing * 4 // 2048px
	const xLargeLineThickness = 4

	// Initialize CSS variables
	const variables = useRef({
		'--grid-offset-x': `0px`,
		'--grid-offset-y': `0px`,
		'--grid-scale': 1,
		'--small-grid-spacing': `${smallGridSpacing}px`,
		'--medium-grid-spacing': `${mediumGridSpacing}px`,
		'--large-grid-spacing': `${largeGridSpacing}px`,
		'--xlarge-grid-spacing': `${xLargeGridSpacing}px`,
	} as CSSProperties)

	const ref = useRef<HTMLDivElement>(null)
	const smallGridRef = useRef<HTMLDivElement>(null)

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
			const effectiveXLargeSpacing = effectiveLargeSpacing * 4

			variables.current = {
				'--grid-offset-x': `${mouseState.gridOffsetX}px`,
				'--grid-offset-y': `${mouseState.gridOffsetY}px`,
				'--grid-scale': mouseState.gridScale,
				'--small-grid-spacing': `${effectiveSmallSpacing}px`,
				'--medium-grid-spacing': `${effectiveMediumSpacing}px`,
				'--large-grid-spacing': `${effectiveLargeSpacing}px`,
				'--xlarge-grid-spacing': `${effectiveXLargeSpacing}px`,
			} as CSSProperties

			// Update the element's CSS variables.
			element.style.setProperty('--grid-offset-x', `${mouseState.gridOffsetX}px`)
			element.style.setProperty('--grid-offset-y', `${mouseState.gridOffsetY}px`)
			element.style.setProperty('--grid-scale', mouseState.gridScale.toString())
			element.style.setProperty('--small-grid-spacing', `${effectiveSmallSpacing}px`)
			element.style.setProperty('--medium-grid-spacing', `${effectiveMediumSpacing}px`)
			element.style.setProperty('--large-grid-spacing', `${effectiveLargeSpacing}px`)
			element.style.setProperty('--xlarge-grid-spacing', `${effectiveXLargeSpacing}px`)
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
			mouseState.gridScale = newScale
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
	}, [largeGridSpacing, mediumGridSpacing, xLargeGridSpacing])

	return (
		<Stack sx={{ width: '100%', height: '100%' }}>
			<Box
				ref={ref}
				style={variables.current}
				sx={{
					position: 'absolute',
					opacity: 1,
					width: '100%',
					height: '100%',
					backgroundPosition: 'var(--grid-offset-x) var(--grid-offset-y)',
					backgroundImage: `
						/* Extra-large grid lines */
						linear-gradient(to right, rgba(0, 0, 0, 1) ${xLargeLineThickness}px, transparent ${xLargeLineThickness}px),
						linear-gradient(to bottom, rgba(0, 0, 0, 1) ${xLargeLineThickness}px, transparent ${xLargeLineThickness}px),
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
					// Use the computed CSS variables for grid spacings.
					backgroundSize: `
						var(--xlarge-grid-spacing) var(--xlarge-grid-spacing),
						var(--xlarge-grid-spacing) var(--xlarge-grid-spacing),
						var(--large-grid-spacing) var(--large-grid-spacing),
						var(--large-grid-spacing) var(--large-grid-spacing),
						var(--medium-grid-spacing) var(--medium-grid-spacing),
						var(--medium-grid-spacing) var(--medium-grid-spacing),
						var(--small-grid-spacing) var(--small-grid-spacing),
						var(--small-grid-spacing) var(--small-grid-spacing)
					`,
				}}
			/>
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
				<Typography variant="h3" component={'div'} sx={{ opacity: 0.25 }}>
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
