import debounce from 'lodash.debounce'
import { useEffect, useRef } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'

type Props = {
	height: number
	drawerVisible: boolean
}

export function useReportOutlinerHeight({ height, drawerVisible }: Props) {
	const notifyAboutHeightChange = useEventBusDispatch({ event: 'outlinerResized' })

	const onResize = useRef(
		debounce((h: number, v: boolean) => {
			notifyAboutHeightChange({ height: v ? h : 0 })
		}, 100),
	)

	useEffect(() => {
		onResize.current(height, drawerVisible)
	}, [height, drawerVisible, notifyAboutHeightChange])
}
