import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import debounce from 'lodash.debounce'
import { Profiler, useEffect, useRef } from 'react'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'

import { CollapsedEventDetails } from '../EventDetails/CollapsedEventDetails'
import { EventDetails } from '../EventDetails/EventDetails'
import { EventTutorialModal } from './components/EventTutorialModal/EventTutorialModal'
import { OutlinerControls } from './components/OutlinerControls/OutlinerControls'

export const Outliner = () => {
	const { isReadOnly } = useIsReadOnly()

	const defaultHeight = 300
	const grabberProps = useResizeGrabber({ defaultHeight })
	const { height, setHeight } = grabberProps

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
			{height > 64 && (
				<Paper sx={{ height, alignItems: 'center' }} elevation={2}>
					<Stack
						direction="row"
						height="100%"
						sx={{
							width: '100%',
							gap: 1,
							'& > :first-of-type': { flex: 2 },
							'& > :nth-of-type(2)': { flex: 3 },
						}}
					>
						{!isReadOnly && <EventDetails />}
						{/* <WorldState />  */}
					</Stack>
					<EventTutorialModal />
				</Paper>
			)}
			{height <= 64 && (
				<CollapsedEventDetails
					onClick={() => {
						setHeight(defaultHeight)
					}}
				/>
			)}
			<ResizeGrabber {...grabberProps} key={grabberProps.key} active={height > 64} />
			<OutlinerControls />
		</Profiler>
	)
}
