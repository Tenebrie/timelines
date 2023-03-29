import { keysOf } from './utils/keysOf'

export const ScaleLevels = {
	minute: 'minute' as const,
	hour: 'hour' as const,
	day: 'day' as const,
	month: 'month' as const,
}
export const OrderedScaleLevels = keysOf(ScaleLevels)
export type ScaleLevel = typeof ScaleLevels[keyof typeof ScaleLevels]
