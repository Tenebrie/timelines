import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabberOverlay'

import { WorldState } from './WorldState'

export function WorldStateWithDragger() {
	const grabberProps = useResizeGrabber({
		minHeight: 350,
	})
	const { visible: drawerVisible, height, overflowHeight, isDraggingNow } = grabberProps

	return (
		<>
			<Paper
				style={{
					width: grabberProps.height,
					marginRight: drawerVisible ? `${overflowHeight}px` : `${-height}px`,
					transition: `margin-right ${isDraggingNow.current ? 0 : 0.3}s`,
				}}
				sx={{ position: 'relative', flexShrink: 0 }}
				elevation={2}
			>
				<Box
					sx={{
						position: 'absolute',
						height: 1,
						zIndex: 1,
						transition: `right ${isDraggingNow.current ? 0 : 0.3}s`,
					}}
				>
					<ResizeGrabber {...grabberProps} active position={'right'} />
				</Box>
				<Box sx={{ height: 1, pointerEvents: grabberProps.isDraggingNow.current ? 'none' : 'unset' }}>
					<WorldState />
				</Box>
				<ResizeGrabberOverlay {...grabberProps} />
			</Paper>
		</>
	)
}
