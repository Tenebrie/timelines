import { z } from 'zod'

export const ScaleLevelSchema = z.number().min(-1).max(100)

export type ScaleLevel = z.infer<typeof ScaleLevelSchema>
