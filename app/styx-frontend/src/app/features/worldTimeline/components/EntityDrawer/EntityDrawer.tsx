import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useSearch } from '@tanstack/react-router'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber'
import { ResizeGrabberOverlay } from '@/app/components/ResizeGrabberOverlay'

import { EventBulkActions } from '../EventBulkActions/EventBulkActions'
import { CollapsedEventDetails } from '../EventDetails/CollapsedEventDetails'
import { EventDetails } from '../EventDetails/EventDetails'
import { useReportOutlinerHeight } from '../Outliner/hooks/useReportOutlinerHeight'

export function EntityDrawer() {
	const grabberProps = useResizeGrabber({
		minHeight: 230,
		defaultHeight: 400,
		openOnEvent: 'timeline/openEventDrawer',
	})
	const {
		visible: drawerVisible,
		height,
		setVisible,
		overflowHeight,
		isDraggingNow,
		isDraggingChild,
	} = grabberProps

	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline',
		select: (search) => search.selection,
	})

	useReportOutlinerHeight({ height, drawerVisible })

	return (
		<>
			<Paper
				style={{
					height,
					marginTop: drawerVisible ? `${overflowHeight}px` : `${-height}px`,
					transition: `margin-top ${isDraggingNow.current ? 0 : 0.3}s`,
				}}
				sx={{
					position: 'relative',
					alignItems: 'center',
				}}
				elevation={2}
			>
				<Stack
					direction="row"
					height="100%"
					sx={{
						'& > *': { flex: 1 },
						pointerEvents: 'auto',
					}}
				>
					{selectedMarkerIds.length < 2 && <EventDetails />}
					{selectedMarkerIds.length >= 2 && <EventBulkActions />}
				</Stack>
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
					<CollapsedEventDetails
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
