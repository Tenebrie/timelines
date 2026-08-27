type Props = {
	screenX: number
	screenY: number
}

export function getMindmapGridPosition({ screenX, screenY }: Props) {
	const grid = document.querySelector<HTMLElement>('[data-mindmap-grid]')
	if (!grid) {
		return null
	}

	const boundingBox = grid.getBoundingClientRect()
	const style = getComputedStyle(grid)
	const offsetX = parseFloat(style.getPropertyValue('--grid-offset-x'))
	const offsetY = parseFloat(style.getPropertyValue('--grid-offset-y'))
	const scale = parseFloat(style.getPropertyValue('--grid-scale'))

	return {
		x: (screenX - boundingBox.x - offsetX) / scale,
		y: (screenY - boundingBox.y - offsetY) / scale,
	}
}
