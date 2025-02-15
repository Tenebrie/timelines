import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSearch } from '@tanstack/react-router'
import debounce from 'lodash.debounce'
import { Profiler, useEffect, useRef } from 'react'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'

import { CollapsedEventDetails } from '../EventDetails/CollapsedEventDetails'
import { EventDetails } from '../EventDetails/EventDetails'

export const Outliner = () => {
	const minHeight = 230
	const defaultHeight = 400
	const grabberProps = useResizeGrabber({ minHeight, defaultHeight, openOnEvent: 'timeline/openEventDrawer' })
	const {
		visible: drawerVisible,
		height,
		setVisible,
		overflowHeight,
		isDraggingNow,
		isDraggingChild,
	} = grabberProps

	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline/_timeline',
		select: (search) => search.selection,
	})

	const notifyAboutHeightChange = useEventBusDispatch({ event: 'outlinerResized' })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			notifyAboutHeightChange({ height: v ? h : 0 })
		}, 100),
	)

	useEffect(() => {
		onResize.current(height, drawerVisible)
	}, [height, drawerVisible, notifyAboutHeightChange])

	return (
		<Profiler id="Outliner" onRender={reportComponentProfile}>
			<Paper
				style={{
					height,
					minHeight,
					marginTop: drawerVisible ? `${overflowHeight}px` : `${-height}px`,
					transition: `margin-top ${isDraggingNow.current ? 0 : 0.3}s, opacity 0.3s`,
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
					{selectedMarkerIds.length >= 2 && (
						<Stack padding={4}>
							<Typography>Bulk actions</Typography>
						</Stack>
					)}
				</Stack>
				<div
					style={{
						backgroundColor: `rgba(255, 255, 255, ${overflowHeight < 0 ? 0.1 : 0.0})`,
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
						borderRadius: '6px',
						transition: 'background-color 0.3s',
					}}
				/>
			</Paper>
			<ResizeGrabber {...grabberProps} active={drawerVisible}>
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
		</Profiler>
	)
}
