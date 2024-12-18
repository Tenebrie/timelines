export const parseHslString = (hsl: string) => {
	const [h, s, l] = hsl.replace('hsl(', '').replace(')', '').replace(/%/g, '').split(',').map(Number)
	return { h: h / 360, s: s / 100, l: l / 100 }
}
