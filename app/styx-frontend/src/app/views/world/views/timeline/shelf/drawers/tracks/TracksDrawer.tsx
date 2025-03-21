import debounce from 'lodash.debounce'
import { memo, useRef } from 'react'

import { ResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawer'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { Shortcut } from '@/app/hooks/useShortcut/useShortcutManager'

import { EventTracksMenu } from './details/EventTracksMenu'
import { TracksDrawerHotkeys } from './TracksDrawerHotkeys'

export const TracksDrawer = memo(TracksDrawerComponent)

function TracksDrawerComponent() {
	const notifyAboutHeightChange = useEventBusDispatch({ event: 'timeline/tracksDrawer/onResize' })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			requestIdleCallback(() => {
				notifyAboutHeightChange({ height: v ? h : 0 })
			})
		}, 100),
	)

	return (
		<ResizeableDrawer
			pulldownWidth={120}
			pulldownLabel="Tracks"
			minHeight={230}
			maxHeight={window.innerHeight - 256}
			persistentStateKey="tracksDrawerState/v1"
			onResize={onResize.current}
			eventHandler={<TracksDrawerHotkeys />}
			hotkey={() => Shortcut.TracksMenu}
		>
			<EventTracksMenu />
		</ResizeableDrawer>
	)
}
