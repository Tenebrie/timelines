import { mergeAttributes } from '@tiptap/core'
import { TextStyle } from '@tiptap/extension-text-style'

import { hexToRgb } from '@/app/utils/colors/hexToRgb'

// sRGB luminance below this → color is too dark to read on a dark background
const DARK_THRESHOLD = 0.04
// sRGB luminance above this → color is too light to read on a light background
const LIGHT_THRESHOLD = 0.7

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

function getLuminance(color: string): number | null {
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

export const ThemeAwareTextStyle = TextStyle.extend({
	renderHTML({ mark, HTMLAttributes }) {
		const color = mark.attrs.color as string | null

		if (!color) {
			return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
		}

		const luminance = getLuminance(color)
		if (luminance === null || (luminance >= DARK_THRESHOLD && luminance <= LIGHT_THRESHOLD)) {
			return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
		}

		return [
			'span',
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				style: `--text-color: ${color}`,
				'data-luminance': luminance < DARK_THRESHOLD ? 'dark' : 'light',
			}),
			0,
		]
	},
})
