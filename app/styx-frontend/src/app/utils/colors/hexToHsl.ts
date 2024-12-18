import { hexToRgb } from './hexToRgb'
import { rgbToHsl } from './rgbToHsl'

export const hexToHsl = (hexColor: string) => {
	const { r, g, b } = hexToRgb(hexColor)
	return rgbToHsl(r, g, b)
}
