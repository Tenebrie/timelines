export function normalizeColor(color: string | undefined) {
	if (!color) {
		return undefined
	}
	if (color.startsWith('#')) {
		return color
	}
	return '#' + color
}
