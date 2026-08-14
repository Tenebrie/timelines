import { useLayoutEffect, useState } from 'react'

export const WIKI_COLUMN_MAX_WIDTH = 900

export function useScreenCenteredColumn(enabled: boolean) {
	const [column, setColumn] = useState<HTMLDivElement | null>(null)

	useLayoutEffect(() => {
		const container = column?.parentElement
		if (!column || !container) {
			return
		}
		if (!enabled) {
			column.style.marginLeft = ''
			return
		}

		const align = () => {
			const containerStyle = getComputedStyle(container)
			const paddingLeft = parseFloat(containerStyle.paddingLeft)
			const paddingRight = parseFloat(containerStyle.paddingRight)
			const contentWidth = container.clientWidth - paddingLeft - paddingRight
			const contentLeft = container.getBoundingClientRect().left + container.clientLeft + paddingLeft

			const columnWidth = Math.min(WIKI_COLUMN_MAX_WIDTH, contentWidth)
			const centered = (window.innerWidth - columnWidth) / 2 - contentLeft
			const margin = Math.min(Math.max(0, centered), contentWidth - columnWidth)
			column.style.marginLeft = `${margin}px`
		}

		align()
		const observer = new ResizeObserver(align)
		observer.observe(container)
		window.addEventListener('resize', align)
		return () => {
			observer.disconnect()
			window.removeEventListener('resize', align)
		}
	}, [column, enabled])

	return setColumn
}
