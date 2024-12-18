import { hslToHex } from './hslToHex'
import { parseHslString } from './parseHslString'

export const hslStringToHex = (hsl: string) => {
	const { h, s, l } = parseHslString(hsl)
	return hslToHex(h, s, l)
}
