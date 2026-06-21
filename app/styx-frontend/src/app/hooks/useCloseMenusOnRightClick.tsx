import { useEffect } from 'react'

export function useCloseMenusOnRightClick() {
	useEffect(() => {
		function handleContextMenu(event: MouseEvent) {
			if (event.shiftKey) {
				event.stopImmediatePropagation()
				return
			}
			const backdrops = window.document.querySelectorAll<HTMLElement>('.MuiModal-root > .MuiBackdrop-root')
			if (backdrops.length === 0) {
				return
			}

			const target = event.target as Element | null
			if (target?.closest('.MuiPopover-paper')) {
				return
			}

			event.preventDefault()

			backdrops.forEach((backdrop) => backdrop.click())
		}

		document.addEventListener('contextmenu', handleContextMenu, true)
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu, true)
		}
	}, [])
}
