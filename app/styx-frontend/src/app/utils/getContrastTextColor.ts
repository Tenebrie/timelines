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

function rgbToHsl(r: number, g: number, b: number) {
	r /= 255
	g /= 255
	b /= 255

	const max = Math.max(r, g, b),
		min = Math.min(r, g, b)
	let h: number = 0
	let s: number
	const l: number = (max + min) / 2

	if (max == min) {
		h = s = 0 // achromatic
	} else {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}

		h /= 6
	}

	return { h: Math.round(h * 100) / 100, s: Math.round(s * 100) / 100, l: Math.round(l * 100) / 100 }
}

export const hexToHsl = (hexColor: string) => {
	const { r, g, b } = hexToRgb(hexColor)
	return rgbToHsl(r, g, b)
}

export const colorStringToHsl = (color: string) => {
	if (color.startsWith('#')) {
		const rgb = hexToRgb(color)
		return rgbToHsl(rgb.r, rgb.g, rgb.b)
	} else if (color.startsWith('hsl')) {
		return parseHslString(color)
	}
	throw new Error('Invalid color string')
}

export const parseHslString = (hsl: string) => {
	const [h, s, l] = hsl.replace('hsl(', '').replace(')', '').replace(/%/g, '').split(',').map(Number)
	return { h: h / 360, s: s / 100, l: l / 100 }
}

export const hslStringToHex = (hsl: string) => {
	const { h, s, l } = parseHslString(hsl)
	return hslToHex(h, s, l)
}

/**
 *
 * @param h in range [0; 1]
 * @param s  in range [0; 1]
 * @param l  in range [0; 1]
 * @returns `#RRGGBB` string
 */
export function hslToHex(h: number, s: number, l: number) {
	h *= 360
	s *= 100
	const a = (s * Math.min(l, 1 - l)) / 100
	const f = (n: number) => {
		const k = (n + h / 30) % 12
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, '0') // convert to Hex and prefix "0" if needed
	}
	return `#${f(0)}${f(8)}${f(4)}`
}

export const getContrastTextColor = (hslOrHex: string) => {
	const hexColor = hslOrHex.startsWith('#') ? hslOrHex : hslStringToHex(hslOrHex)
	const rgb = hexToRgb(hexColor)
	const black = { r: 0, g: 0, b: 0 }
	const white = { r: 255, g: 255, b: 255 }
	return contrast(rgb, black) > contrast(rgb, white) ? '#000000' : '#ffffff'
}
