import { hexToRgb } from './hexToRgb'
import { parseHslString } from './parseHslString'
import { parseRgbString } from './parseRgbString'
import { rgbToHsl } from './rgbToHsl'

const hexColorRegex = /^#[a-fA-F0-9]+$/
const rgbColorRegex = /^rgb\([0-9]+,[0-9]+,[0-9]+\)$/
const hslColorRegex = /^hsl\([0-9]+,[0-9%]+,[0-9%]+\)$/

export const colorStringToHsl = (color: string) => {
	const trimmedColor = color.toLowerCase().trim().replace(/\s/g, '')
	if (hexColorRegex.test(trimmedColor) && (color.length === 4 || color.length === 7)) {
		const rgb = hexToRgb(trimmedColor)
		return rgbToHsl(rgb.r, rgb.g, rgb.b)
	} else if (rgbColorRegex.test(trimmedColor)) {
		const rgb = parseRgbString(trimmedColor)
		return rgbToHsl(rgb.r * 255, rgb.g * 255, rgb.b * 255)
	} else if (hslColorRegex.test(trimmedColor)) {
		return parseHslString(trimmedColor)
	}
	throw new Error('Invalid color string')
}

export const colorStringToHslWithDefault = (
	color: string,
	defaultValue: { h: number; s: number; l: number },
) => {
	try {
		return colorStringToHsl(color)
	} catch {
		return defaultValue
	}
}
