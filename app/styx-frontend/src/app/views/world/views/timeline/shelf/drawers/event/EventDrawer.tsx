import debounce from 'lodash.debounce'
import { memo, useRef } from 'react'

import { ResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawer'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { Shortcut } from '@/app/hooks/useShortcut/useShortcutManager'
import { useCurrentOrNewEvent } from '@/app/views/world/views/timeline/shelf/drawers/event/details/hooks/useCurrentOrNewEvent'

import { EventDrawerListener } from './EventDrawerListener'
import { EventDrawerOutlet } from './EventDrawerOutlet'

export const EventDrawer = memo(EventDrawerComponent)

function EventDrawerComponent() {
	const theme = useCustomTheme()
	const { mode } = useCurrentOrNewEvent()
	const notifyAboutHeightChange = useEventBusDispatch({ event: 'timeline/eventDrawer/onResize' })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			requestIdleCallback(() => {
				notifyAboutHeightChange({ height: v ? h : 0 })
			})
		}, 100),
	)

	return (
		<ResizeableDrawer
			pulldownWidth={150}
			pulldownLabel={mode === 'edit' ? 'Edit event' : <>New event</>}
			minHeight={235}
			persistentStateKey="entityDrawerState/v1"
			onResize={onResize.current}
			keepMounted
			hotkey={Shortcut.CreateNew}
		>
			<EventDrawerOutlet />
			<EventDrawerListener />
		</ResizeableDrawer>
	)
}
