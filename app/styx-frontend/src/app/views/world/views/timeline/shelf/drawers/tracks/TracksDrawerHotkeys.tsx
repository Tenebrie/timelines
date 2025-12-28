import { useResizeableDrawer } from '@/app/components/ResizeGrabber/ResizeableDrawerContext'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

export function TracksDrawerHotkeys() {
	const { drawerVisible, setDrawerVisible } = useResizeableDrawer()

	useShortcut(Shortcut.TracksMenu, () => {
		setDrawerVisible(!drawerVisible)
	})

	return <></>
}
