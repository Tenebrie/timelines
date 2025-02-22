/**
 * @returns `#RRGGBB` string
 */

import { hslToHex } from './hslToHex'

export function getRandomEntityColor() {
	return hslToHex(Math.random(), 0.5, 0.5)
}
