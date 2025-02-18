import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useEffect } from 'react'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabber/ResizeGrabberOverlay'
import { ResizeGrabberPreferencesSchema } from '@/app/components/ResizeGrabber/ResizeGrabberPreferencesSchema'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import usePersistentState from '@/app/hooks/usePersistentState'

import { useReportOutlinerHeight } from '../Outliner/useReportOutlinerHeight'
import { EntityDrawerOutlet } from './EntityDrawerOutlet'
import { EntityDrawerPulldown } from './EntityDrawerPulldown'

export function EntityDrawer() {
	const [preferences, setPreferences] = usePersistentState(
		'entityDrawerState/v1',
		ResizeGrabberPreferencesSchema,
		{
			height: 400,
			visible: true,
		},
	)

	const minHeight = 235
	const grabberProps = useResizeGrabber({
		minHeight,
		initialOpen: preferences.visible,
		initialHeight: preferences.height,
		keepMounted: true,
	})
	const {
		drawerVisible,
		contentVisible,
		height,
		setVisible,
		setHeight,
		overflowHeight,
		isDraggingNow,
		isDraggingChild,
	} = grabberProps

	useEffect(() => {
		setPreferences({ height, visible: drawerVisible })
	}, [drawerVisible, height, setPreferences])

	useEventBusSubscribe({
		event: 'timeline/openEventDrawer',
		callback: ({ extraHeight }) => {
			setVisible(true)
			if (extraHeight) {
				setHeight(Math.max(minHeight, height + extraHeight))
			}
		},
	})

	useReportOutlinerHeight({ height, drawerVisible, event: 'outliner/entityDrawerResized' })

	return (
		<>
			<Paper
				style={{
					height,
					marginTop: drawerVisible ? `${overflowHeight}px` : `${-height}px`,
					transition: `height ${isDraggingNow.current ? 0 : 0.3}s ease-in-out, margin-top ${isDraggingNow.current ? 0 : 0.3}s`,
				}}
				sx={{
					position: 'relative',
					alignItems: 'center',
				}}
				elevation={2}
			>
				{contentVisible && (
					<Stack
						direction="row"
						height="100%"
						sx={{
							'& > *': { flex: 1 },
							pointerEvents: 'auto',
						}}
					>
						<EntityDrawerOutlet isOpen={drawerVisible} onClear={() => setVisible(false)} />
					</Stack>
				)}
				<ResizeGrabberOverlay {...grabberProps} />
			</Paper>
			<ResizeGrabber {...grabberProps} active={drawerVisible} position="top">
				<Box
					sx={{
						opacity: drawerVisible && !isDraggingChild ? 0 : 1,
						transition: 'opacity 0.3s',
						pointerEvents: 'none',
					}}
				>
					<EntityDrawerPulldown
						visible={!drawerVisible}
						onClick={() => {
							setVisible(true)
						}}
					/>
				</Box>
			</ResizeGrabber>
		</>
	)
}
