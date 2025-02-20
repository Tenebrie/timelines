import Construction from '@mui/icons-material/Construction'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CSSProperties, useEffect, useRef } from 'react'

export function Mindmap() {
	// Small grid: the base grid
	const smallGridSpacing = 32
	const smallLineThickness = 1

	// Medium grid: every 4 small grids
	const mediumGridSpacing = smallGridSpacing * 4 // 256px
	const mediumLineThickness = 2

	// Large grid: every 4 medium grids
	const largeGridSpacing = mediumGridSpacing * 4 // 1024px
	const largeLineThickness = 3

	// Extra-large grid: every 4 large grids
	const xLargeGridSpacing = largeGridSpacing * 4 // 4096px
	const xLargeLineThickness = 4

	// const [gridOffset, setGridOffset] = useState<Position>({ x: 0, y: 0 })
	// const [gridScale, setGridScale] = useState(1)

	const variables = useRef({
		'--grid-offset-x': `0px`,
		'--grid-offset-y': `0px`,
		'--grid-scale': 1,
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
		}

		const update = () => {
			variables.current = {
				'--grid-offset-x': `${mouseState.gridOffsetX}px`,
				'--grid-offset-y': `${mouseState.gridOffsetY}px`,
				'--grid-scale': mouseState.gridScale,
			} as CSSProperties
			element.style.setProperty('--grid-offset-x', `${mouseState.gridOffsetX}px`)
			element.style.setProperty('--grid-offset-y', `${mouseState.gridOffsetY}px`)
			element.style.setProperty('--grid-scale', mouseState.gridScale.toString())
		}

		const handleMouseDown = (event: MouseEvent) => {
			if (event.button !== 0) {
				return
			}
			mouseState.isDragging = true
		}

		const handleMouseUp = (event: MouseEvent) => {
			if (event.button !== 0) {
				return
			}
			mouseState.isDragging = false
		}

		const handleMouseMove = (event: MouseEvent) => {
			if (!mouseState.isDragging) {
				return
			}
			mouseState.gridOffsetX += event.movementX
			mouseState.gridOffsetY += event.movementY
			update()
		}

		const handleWheel = (event: WheelEvent) => {
			// Prevent default scrolling behavior
			event.preventDefault()

			// Get element's dimensions and compute its center.
			const rect = element.getBoundingClientRect()
			const centerX = rect.width / 2
			const centerY = rect.height / 2

			const oldScale = mouseState.gridScale
			// Calculate new scale based on the wheel delta.
			let newScale = oldScale * (1 - event.deltaY / 1000)
			newScale = Math.min(Math.max(0.1, newScale), 10)

			const scaleFactor = newScale / oldScale

			// Adjust the grid offset so that the center remains fixed.
			mouseState.gridOffsetX = centerX - scaleFactor * (centerX - mouseState.gridOffsetX)
			mouseState.gridOffsetY = centerY - scaleFactor * (centerY - mouseState.gridOffsetY)
			mouseState.gridScale = newScale
			update()
		}

		element.addEventListener('mousedown', handleMouseDown)
		element.addEventListener('mousemove', handleMouseMove)
		element.addEventListener('wheel', handleWheel, { passive: false })
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			element.removeEventListener('mousedown', handleMouseDown)
			element.removeEventListener('mousemove', handleMouseMove)
			element.removeEventListener('wheel', handleWheel)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [])

	return (
		<Stack sx={{ width: '100%', height: '100%' }}>
			<Stack
				ref={ref}
				style={variables.current}
				sx={{
					position: 'absolute',
					opacity: 1,
					width: '100%',
					height: '100%',
					// Use CSS variables for offset and scale.
					backgroundPosition: 'var(--grid-offset-x) var(--grid-offset-y)',
					backgroundImage: `
						/* Extra-large grid lines */
						linear-gradient(to right, rgba(0, 0, 0, 0.4) ${xLargeLineThickness}px, transparent ${xLargeLineThickness}px),
						linear-gradient(to bottom, rgba(0, 0, 0, 0.4) ${xLargeLineThickness}px, transparent ${xLargeLineThickness}px),
						/* Large grid lines */
						linear-gradient(to right, rgba(0, 0, 0, 0.3) ${largeLineThickness}px, transparent ${largeLineThickness}px),
						linear-gradient(to bottom, rgba(0, 0, 0, 0.3) ${largeLineThickness}px, transparent ${largeLineThickness}px),
						/* Medium grid lines */
						linear-gradient(to right, rgba(0, 0, 0, 0.2) ${mediumLineThickness}px, transparent ${mediumLineThickness}px),
						linear-gradient(to bottom, rgba(0, 0, 0, 0.2) ${mediumLineThickness}px, transparent ${mediumLineThickness}px),
						/* Small grid lines */
						linear-gradient(to right, rgba(0, 0, 0, 0.1) ${smallLineThickness}px, transparent ${smallLineThickness}px),
						linear-gradient(to bottom, rgba(0, 0, 0, 0.1) ${smallLineThickness}px, transparent ${smallLineThickness}px)
					`,
					backgroundSize: `
						calc(${xLargeGridSpacing}px * var(--grid-scale, 1)) calc(${xLargeGridSpacing}px * var(--grid-scale, 1)),
						calc(${xLargeGridSpacing}px * var(--grid-scale, 1)) calc(${xLargeGridSpacing}px * var(--grid-scale, 1)),
						calc(${largeGridSpacing}px * var(--grid-scale, 1)) calc(${largeGridSpacing}px * var(--grid-scale, 1)),
						calc(${largeGridSpacing}px * var(--grid-scale, 1)) calc(${largeGridSpacing}px * var(--grid-scale, 1)),
						calc(${mediumGridSpacing}px * var(--grid-scale, 1)) calc(${mediumGridSpacing}px * var(--grid-scale, 1)),
						calc(${mediumGridSpacing}px * var(--grid-scale, 1)) calc(${mediumGridSpacing}px * var(--grid-scale, 1)),
						calc(${smallGridSpacing}px * var(--grid-scale, 1)) calc(${smallGridSpacing}px * var(--grid-scale, 1)),
						calc(${smallGridSpacing}px * var(--grid-scale, 1)) calc(${smallGridSpacing}px * var(--grid-scale, 1))
					`,
				}}
			></Stack>
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
				<Typography variant="h3" component={'div'} sx={{ opacity: 0.5 }}>
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
