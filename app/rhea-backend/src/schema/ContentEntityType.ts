import { z } from 'zod'

export const SUPPORTED_CONTENT_ENTITIES = ['actor', 'event', 'article'] as const

export const ContentEntityTypeSchema = z.enum(SUPPORTED_CONTENT_ENTITIES)

export type ContentEntityType = z.infer<typeof ContentEntityTypeSchema>
