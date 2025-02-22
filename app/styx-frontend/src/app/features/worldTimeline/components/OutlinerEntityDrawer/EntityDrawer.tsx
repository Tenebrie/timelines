import debounce from 'lodash.debounce'
import { memo, useRef } from 'react'

import { ResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawer'
import { useEventBusDispatch } from '@/app/features/eventBus'

import { useCurrentOrNewEvent } from '../../hooks/useCurrentOrNewEvent'
import { EntityDrawerListener } from './EntityDrawerListener'
import { EntityDrawerOutlet } from './EntityDrawerOutlet'

export const EntityDrawer = memo(EntityDrawerComponent)

function EntityDrawerComponent() {
	const { mode } = useCurrentOrNewEvent()
	const notifyAboutHeightChange = useEventBusDispatch({ event: 'outliner/entityDrawerResized' })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			requestIdleCallback(() => {
				notifyAboutHeightChange({ height: v ? h : 0 })
			})
		}, 100),
	)

	return (
		<ResizeableDrawer
			pulldownWidth={140}
			pulldownLabel={mode === 'edit' ? 'Edit event' : 'Create event'}
			minHeight={235}
			persistentStateKey="entityDrawerState/v1"
			onResize={onResize.current}
			keepMounted
		>
			<EntityDrawerOutlet />
			<EntityDrawerListener />
		</ResizeableDrawer>
	)
}
