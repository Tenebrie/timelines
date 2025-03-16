import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useEffect } from 'react'

import { Outliner } from '@/app/components/Outliner/Outliner'
import { OutlinerOutlet } from '@/app/components/Outliner/OutlinerOutlet'
import { ResizeableDrawerProvider } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabber/ResizeGrabberOverlay'
import { ResizeGrabberPreferencesSchema } from '@/app/components/ResizeGrabber/ResizeGrabberPreferencesSchema'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import usePersistentState from '@/app/hooks/usePersistentState'

export function OutlinerDrawer() {
	const minHeight = 300
	const [preferences, setPreferences] = usePersistentState(
		'mainWorldState/v1',
		ResizeGrabberPreferencesSchema,
		{
			height: minHeight,
			visible: true,
		},
	)

	const grabberProps = useResizeGrabber({
		initialOpen: preferences.visible,
		initialHeight: preferences.height,
		minHeight,
	})
	const { drawerVisible, contentVisible, height, overflowHeight, isDragging, setHeight, setVisible } =
		grabberProps

	useEffect(() => {
		setPreferences({ height, visible: drawerVisible })
	}, [drawerVisible, height, setPreferences])

	useEventBusSubscribe({
		event: 'timeline/eventEditor/requestOpen',
		callback: () => {
			setVisible(true)
		},
	})

	return (
		<>
			<ResizeableDrawerProvider
				drawerVisible={drawerVisible}
				height={height}
				minHeight={minHeight}
				preferredOpen={preferences.visible}
				setDrawerHeight={setHeight}
				setDrawerVisible={setVisible}
			>
				<Paper
					style={{
						width: grabberProps.height,
						marginRight: drawerVisible ? `${overflowHeight}px` : `${-height}px`,
						transition: `margin-right ${isDragging ? 0 : 0.3}s`,
					}}
					sx={{ position: 'relative', flexShrink: 0, zIndex: 2 }}
					elevation={2}
				>
					<Box
						sx={{
							position: 'absolute',
							height: 1,
							zIndex: 1,
							transition: `right ${isDragging ? 0 : 0.3}s`,
							marginLeft: -0.6,
						}}
					>
						<ResizeGrabber {...grabberProps} active position={'right'} />
					</Box>
					<Box sx={{ height: 1, pointerEvents: grabberProps.isDragging ? 'none' : 'unset' }}>
						<OutlinerOutlet />
						{contentVisible && <Outliner />}
					</Box>
					<ResizeGrabberOverlay {...grabberProps} />
				</Paper>
			</ResizeableDrawerProvider>
		</>
	)
}
