import { useCallback } from 'react'

import { getColorLuminance, parseColor } from './getColorLuminance'

// WCAG contrast ratio below this -> color is too close to the background to read.
const MIN_CONTRAST_RATIO = 3

// Background luminance below this -> lightening the color gains more contrast than darkening it.
const LUMINANCE_MIDPOINT = 0.179

export function useColorUtils() {
	const adaptColor = useCallback((color: string, backgroundColor: string) => {
		const colorLuminance = getColorLuminance(color)
		const backgroundLuminance = getColorLuminance(backgroundColor)
		if (colorLuminance === null || backgroundLuminance === null) {
			return color
		}
		if (getContrastRatio(colorLuminance, backgroundLuminance) >= MIN_CONTRAST_RATIO) {
			return color
		}
		return backgroundLuminance < LUMINANCE_MIDPOINT
			? setOklchLightness(color, 0.75)
			: setOklchLightness(color, 0.45)
	}, [])

	const setOpacity = useCallback((color: string | undefined, opacity: number) => {
		if (!color) {
			return '#000000'
		}
		if (color.startsWith('hsl(')) {
			return color.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`)
		}
		const alpha = Math.round(opacity * 255)
			.toString(16)
			.padStart(2, '0')
		return `${color}${alpha}`
	}, [])

	return { adaptColor, setOpacity }
}

function getContrastRatio(luminanceA: number, luminanceB: number) {
	const lighter = Math.max(luminanceA, luminanceB)
	const darker = Math.min(luminanceA, luminanceB)
	return (lighter + 0.05) / (darker + 0.05)
}

// Returns a concrete hex color (not a CSS relative color string) so that consumers
// like getContrastTextColor and setOpacity can still parse the result.
function setOklchLightness(color: string, lightness: number) {
	const rgb = parseColor(color)
	if (!rgb) {
		return color
	}
	const { c, h } = rgbToOklch(rgb)
	return oklchToHex(lightness, c, h)
}

// OKLab conversion math from https://bottosson.github.io/posts/oklab/
function rgbToOklch({ r, g, b }: { r: number; g: number; b: number }) {
	const [lr, lg, lb] = [r, g, b].map((v) => srgbToLinear(v / 255))
	const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
	const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
	const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
	const labA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
	const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	return {
		l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		c: Math.sqrt(labA * labA + labB * labB),
		h: Math.atan2(labB, labA),
	}
}

function oklchToHex(l: number, c: number, h: number) {
	const labA = c * Math.cos(h)
	const labB = c * Math.sin(h)
	const lmsL = (l + 0.3963377774 * labA + 0.2158037573 * labB) ** 3
	const lmsM = (l - 0.1055613458 * labA - 0.0638541728 * labB) ** 3
	const lmsS = (l - 0.0894841775 * labA - 1.291485548 * labB) ** 3
	const lr = 4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS
	const lg = -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS
	const lb = -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS
	const toHexChannel = (v: number) => {
		// Saturated colors can fall outside the sRGB gamut after the lightness change
		const clamped = Math.min(1, Math.max(0, linearToSrgb(v)))
		return Math.round(clamped * 255)
			.toString(16)
			.padStart(2, '0')
	}
	return `#${toHexChannel(lr)}${toHexChannel(lg)}${toHexChannel(lb)}`
}

function srgbToLinear(v: number) {
	return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function linearToSrgb(v: number) {
	return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}
