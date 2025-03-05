import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useEffect } from 'react'

import { Outliner } from '@/app/components/Outliner/Outliner'
import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabber/ResizeGrabberOverlay'
import { ResizeGrabberPreferencesSchema } from '@/app/components/ResizeGrabber/ResizeGrabberPreferencesSchema'
import usePersistentState from '@/app/hooks/usePersistentState'

export function OutlinerDrawer() {
	const [preferences, setPreferences] = usePersistentState(
		'mainWorldState/v1',
		ResizeGrabberPreferencesSchema,
		{
			height: 300,
			visible: true,
		},
	)

	const grabberProps = useResizeGrabber({
		initialOpen: preferences.visible,
		initialHeight: preferences.height,
		minHeight: 300,
	})
	const { drawerVisible, contentVisible, height, overflowHeight, isDraggingNow } = grabberProps

	useEffect(() => {
		setPreferences({ height, visible: drawerVisible })
	}, [drawerVisible, height, setPreferences])

	return (
		<>
			<Paper
				style={{
					width: grabberProps.height,
					marginRight: drawerVisible ? `${overflowHeight}px` : `${-height}px`,
					transition: `margin-right ${isDraggingNow.current ? 0 : 0.3}s`,
				}}
				sx={{ position: 'relative', flexShrink: 0, zIndex: 2 }}
				elevation={2}
			>
				<Box
					sx={{
						position: 'absolute',
						height: 1,
						zIndex: 1,
						transition: `right ${isDraggingNow.current ? 0 : 0.3}s`,
						marginLeft: -0.6,
					}}
				>
					<ResizeGrabber {...grabberProps} active position={'right'} />
				</Box>
				<Box sx={{ height: 1, pointerEvents: grabberProps.isDraggingNow.current ? 'none' : 'unset' }}>
					{contentVisible && <Outliner />}
				</Box>
				<ResizeGrabberOverlay {...grabberProps} />
			</Paper>
		</>
	)
}
