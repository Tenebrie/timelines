import debounce from 'lodash.debounce'
import { memo, useRef } from 'react'

import { ResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawer'
import { useEventBusDispatch } from '@/app/features/eventBus'

import { EventTracksMenu } from './EventTracksMenu'

export const TracksDrawer = memo(TracksDrawerComponent)

function TracksDrawerComponent() {
	const notifyAboutHeightChange = useEventBusDispatch({ event: 'outliner/tracksDrawerResized' })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			requestIdleCallback(() => {
				notifyAboutHeightChange({ height: v ? h : 0 })
			})
		}, 100),
	)

	return (
		<ResizeableDrawer
			pulldownWidth={100}
			pulldownLabel="Tracks"
			minHeight={400}
			persistentStateKey="tracksDrawerState/v1"
			onResize={onResize.current}
		>
			<EventTracksMenu />
		</ResizeableDrawer>
	)
}
