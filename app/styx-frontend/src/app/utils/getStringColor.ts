import { CustomTheme, useCustomTheme } from '../../hooks/useCustomTheme'
import { hashCode } from './hashCode'

export const getStringColor = (value: string, theme: CustomTheme) => {
	const hash = Math.abs(hashCode(value))
	const table: Record<number, { r: number; g: number; b: number }> = {
		0: { r: 255, g: 0, b: 0 },
		1: { r: 0, g: 255, b: 0 },
		2: { r: 0, g: 0, b: 255 },
		3: { r: 255, g: 255, b: 0 },
		4: { r: 255, g: 0, b: 255 },
		5: { r: 0, g: 255, b: 255 },
		6: { r: 255, g: 128, b: 0 },
		7: { r: 255, g: 0, b: 128 },
		8: { r: 0, g: 255, b: 128 },
		9: { r: 0, g: 128, b: 255 },
		10: { r: 128, g: 255, b: 0 },
		11: { r: 128, g: 0, b: 255 },
		12: { r: 255, g: 128, b: 128 },
		13: { r: 128, g: 255, b: 128 },
		14: { r: 128, g: 128, b: 255 },
		15: { r: 255, g: 255, b: 128 },
		16: { r: 255, g: 128, b: 255 },
		17: { r: 128, g: 255, b: 255 },
		18: { r: 128, g: 128, b: 128 },
	}

	const color = table[hash % 19]
	const processedColor = (() => {
		if (theme.mode === 'light') {
			return {
				r: color.r / 2 + 50,
				g: color.g / 2 + 50,
				b: color.b / 2 + 50,
			}
		}

		return {
			r: color.r / 2.5 + 150,
			g: color.g / 2.5 + 150,
			b: color.b / 2.5 + 150,
		}
	})()

	return `rgb(${processedColor.r}, ${processedColor.g}, ${processedColor.b})`
}

export const useStringColor = () => {
	const theme = useCustomTheme()
	return {
		getStringColor: (value: string) => getStringColor(value, theme),
	}
}
