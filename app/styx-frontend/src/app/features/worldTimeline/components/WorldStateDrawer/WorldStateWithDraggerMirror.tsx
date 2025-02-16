import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabberOverlay'

import { WorldState } from './WorldState'

export function WorldStateWithDraggerMirror() {
	const grabberProps = useResizeGrabber({
		minHeight: 350,
	})
	const { visible: drawerVisible, height, overflowHeight, isDraggingNow } = grabberProps
	console.log(overflowHeight)

	return (
		<>
			<Paper
				style={{
					width: grabberProps.height,
					marginLeft: drawerVisible ? `${Math.max(overflowHeight, -350)}px` : `${-height}px`,
					transition: `margin-left ${isDraggingNow.current ? 0 : 0.3}s`,
				}}
				sx={{ position: 'relative', flexShrink: 0 }}
				elevation={2}
			>
				<Box sx={{ height: 1, pointerEvents: grabberProps.isDraggingNow.current ? 'none' : 'unset' }}>
					<WorldState />
				</Box>
				<Box
					sx={{
						top: 0,
						right: 0,
						position: 'absolute',
						height: 1,
						zIndex: 1,
					}}
				>
					<ResizeGrabber {...grabberProps} active position={'left'} />
				</Box>
				<ResizeGrabberOverlay {...grabberProps} />
			</Paper>
		</>
	)
}
