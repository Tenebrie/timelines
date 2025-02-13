import { useMediaQuery } from '@mui/material'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import debounce from 'lodash.debounce'
import { Profiler, useEffect, useRef } from 'react'

import { ResizeGrabber, useResizeGrabber } from '@/app/components/ResizeGrabber'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'

import { EventCreator } from '../EventEditor/EventCreator'
import { EventTutorialModal } from './components/EventTutorialModal/EventTutorialModal'
import { OutlinerControls } from './components/OutlinerControls/OutlinerControls'
import { WorldState } from './components/WorldState'

export const Outliner = () => {
	const { isReadOnly } = useIsReadOnly()

	const theme = useCustomTheme()
	const isLargeScreen = useMediaQuery(theme.material.breakpoints.up('lg'))

	const grabberProps = useResizeGrabber({ defaultHeight: 600 })
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
			<Paper sx={{ height, alignItems: 'center' }}>
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
					{isLargeScreen && !isReadOnly && <EventCreator mode="create-compact" />}
					<WorldState />
				</Stack>
				<EventTutorialModal />
			</Paper>
			<ResizeGrabber {...grabberProps} key={grabberProps.key} />
			<OutlinerControls />
		</Profiler>
	)
}
