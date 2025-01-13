export function rgbToHsl(r: number, g: number, b: number) {
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

	return {
		h: Math.round(h * 10000) / 10000,
		s: Math.round(s * 10000) / 10000,
		l: Math.round(l * 10000) / 10000,
	}
}
