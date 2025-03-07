import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { useEventBusSubscribe } from '@/app/features/eventBus'

export function ActorDrawerListener() {
	const { height, minHeight, setDrawerHeight, setDrawerVisible } = useResizeableDrawer()

	useEventBusSubscribe({
		event: 'mindmap/actorDrawer/requestOpen',
		callback: ({ extraHeight }) => {
			setDrawerVisible(true)
			if (extraHeight) {
				setDrawerHeight(Math.max(minHeight, height + extraHeight))
			}
		},
	})

	return <></>
}
