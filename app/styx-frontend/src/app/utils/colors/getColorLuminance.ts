import { hexToRgb } from './hexToRgb'

// sRGB luminance below this -> color is too dark to read on a dark background
export const DARK_LUMINANCE_THRESHOLD = 0.04
// sRGB luminance above this -> color is too light to read on a light background
export const LIGHT_LUMINANCE_THRESHOLD = 0.7

function parseColor(color: string): { r: number; g: number; b: number } | null {
	if (color.startsWith('#')) {
		return hexToRgb(color)
	}
	// Browsers normalize hex colors to rgb(...) on HTML round-trips
	const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
	if (rgbMatch) {
		return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) }
	}
	return null
}

export function getColorLuminance(color: string): number | null {
	try {
		const rgb = parseColor(color)
		if (!rgb) return null
		const toLinear = (v: number) => {
			const normalized = v / 255
			return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
		}
		return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
	} catch {
		return null
	}
}
