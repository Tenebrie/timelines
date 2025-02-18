import debounce from 'lodash.debounce'
import { useEffect, useRef } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { AllowedEvents } from '@/app/features/eventBus/types'

type Props = {
	event: AllowedEvents
	height: number
	drawerVisible: boolean
}

export function useReportOutlinerHeight({ event, height, drawerVisible }: Props) {
	const notifyAboutHeightChange = useEventBusDispatch({ event })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			notifyAboutHeightChange({ height: v ? h : 0 })
		}, 100),
	)

	useEffect(() => {
		onResize.current(height, drawerVisible)
	}, [height, drawerVisible, notifyAboutHeightChange])
}
