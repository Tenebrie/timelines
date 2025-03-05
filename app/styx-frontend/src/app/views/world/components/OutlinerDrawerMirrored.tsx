import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useEffect } from 'react'

import { Outliner } from '@/app/components/Outliner/Outliner'
import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabber/ResizeGrabberOverlay'
import { ResizeGrabberPreferencesSchema } from '@/app/components/ResizeGrabber/ResizeGrabberPreferencesSchema'
import usePersistentState from '@/app/hooks/usePersistentState'

export function OutlinerDrawerMirrored() {
	const [preferences, setPreferences] = usePersistentState(
		'mirrorWorldState/v1',
		ResizeGrabberPreferencesSchema,
		{
			height: 300,
			visible: false,
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
					marginLeft: drawerVisible ? `${Math.max(overflowHeight, -350)}px` : `${-height}px`,
					transition: `margin-left ${isDraggingNow.current ? 0 : 0.3}s`,
				}}
				sx={{ position: 'relative', flexShrink: 0, zIndex: 2 }}
				elevation={2}
			>
				<Box sx={{ height: 1, pointerEvents: grabberProps.isDraggingNow.current ? 'none' : 'unset' }}>
					{contentVisible && <Outliner />}
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
