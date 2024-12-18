export const parseRgbString = (rgb: string) => {
	const [r, g, b] = rgb.replace('rgb(', '').replace(')', '').split(',').map(Number)
	return { r: r / 255, g: g / 255, b: b / 255 }
}
