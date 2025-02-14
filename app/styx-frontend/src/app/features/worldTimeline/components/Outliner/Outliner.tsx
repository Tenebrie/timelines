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
	const { visible, height, setVisible } = grabberProps

	const selectedMarkerIds = useSearch({
		from: '/world/$worldId/_world/timeline/_timeline',
		select: (search) => search.selection,
	})

	const notifyAboutHeightChange = useEventBusDispatch({ event: 'outlinerResized' })

	const onResize = useRef(
		debounce((h: number) => {
			notifyAboutHeightChange({ height: h })
		}, 100),
	)

	useEffect(() => {
		onResize.current(height)
	}, [height, notifyAboutHeightChange])

	return (
		<Profiler id="Outliner" onRender={reportComponentProfile}>
			<Paper
				sx={{
					height,
					minHeight,
					alignItems: 'center',
					marginTop: visible ? '0' : `${-height}px`,
					opacity: visible ? 1 : 0,
					transition: 'margin-top 0.3s, opacity 0.3s',
				}}
				elevation={2}
			>
				<Stack
					direction="row"
					height="100%"
					sx={{
						'& > *': { flex: 1 },
					}}
				>
					{selectedMarkerIds.length < 2 && <EventDetails />}
					{selectedMarkerIds.length >= 2 && (
						<Stack padding={4}>
							<Typography>Bulk actions</Typography>
						</Stack>
					)}
				</Stack>
			</Paper>
			<ResizeGrabber {...grabberProps} key={grabberProps.key} active={visible} />
			<Box
				sx={{
					opacity: visible ? 0 : 1,
					transition: 'opacity 0.3s',
					pointerEvents: visible ? 'none' : 'auto',
				}}
			>
				<CollapsedEventDetails
					onClick={() => {
						setVisible(true)
					}}
				/>
			</Box>
		</Profiler>
	)
}
