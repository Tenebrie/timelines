type RgbColor = { r: number; g: number; b: number }

const RED = 0.2126
const GREEN = 0.7152
const BLUE = 0.0722

const GAMMA = 2.4

function luminance({ r, g, b }: RgbColor) {
	const a = [r, g, b].map((v) => {
		v /= 255
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA)
	})
	return a[0] * RED + a[1] * GREEN + a[2] * BLUE
}

function contrast(rgb1: RgbColor, rgb2: RgbColor) {
	const lum1 = luminance(rgb1)
	const lum2 = luminance(rgb2)
	const brightest = Math.max(lum1, lum2)
	const darkest = Math.min(lum1, lum2)
	return (brightest + 0.05) / (darkest + 0.05)
}

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

export const getContrastTextColor = (hexColor: string) => {
	const rgb = hexToRgb(hexColor)
	const black = { r: 0, g: 0, b: 0 }
	const white = { r: 255, g: 255, b: 255 }
	return contrast(rgb, black) > contrast(rgb, white) ? '#000000' : '#ffffff'
}
