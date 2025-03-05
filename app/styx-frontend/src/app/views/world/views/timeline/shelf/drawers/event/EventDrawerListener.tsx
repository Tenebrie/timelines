import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { useEventBusSubscribe } from '@/app/features/eventBus'

export function EventDrawerListener() {
	const { height, minHeight, setDrawerHeight, setDrawerVisible } = useResizeableDrawer()

	useEventBusSubscribe({
		event: 'timeline/openEventDrawer',
		callback: ({ extraHeight }) => {
			setDrawerVisible(true)
			if (extraHeight) {
				setDrawerHeight(Math.max(minHeight, height + extraHeight))
			}
		},
	})

	useEventBusSubscribe({
		event: 'timeline/closeEventDrawer',
		callback: () => {
			setDrawerVisible(false)
		},
	})

	return <></>
}
