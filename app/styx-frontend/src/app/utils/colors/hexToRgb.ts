/**
 * @returns rgb in [0; 255] range
 */

export const hexToRgb = (hexColor: string) => {
	if (hexColor.startsWith('#')) {
		hexColor = hexColor.slice(1)
	}
	if (hexColor.length === 3) {
		hexColor = hexColor
			.split('')
			.map((char) => char + char)
			.join('')
	}

	const r = parseInt(hexColor.slice(0, 2), 16)
	const g = parseInt(hexColor.slice(2, 4), 16)
	const b = parseInt(hexColor.slice(4, 6), 16)
	return { r, g, b }
}
