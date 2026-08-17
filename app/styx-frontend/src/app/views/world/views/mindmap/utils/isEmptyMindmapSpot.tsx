type Props = {
	screenX: number
	screenY: number
}

export function isEmptyMindmapSpot({ screenX, screenY }: Props) {
	const elements = document.elementsFromPoint(screenX, screenY)

	return (
		elements.some((element) => element.hasAttribute('data-mindmap-grid')) &&
		!elements.some((element) => element.hasAttribute('data-mindmap-node'))
	)
}
