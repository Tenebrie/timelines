import { z } from 'zod'

export const ScaleLevelSchema = z.union([
	z.literal(-1),
	z.literal(0),
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
	z.literal(6),
	z.literal(7),
])

export type ScaleLevel = z.infer<typeof ScaleLevelSchema>
