import { z } from 'zod'

export const SUPPORTED_WIKI_ENTITIES = ['actor', 'article', 'folder', 'event', 'tag'] as const

export const WikiEntityTypeSchema = z.enum(SUPPORTED_WIKI_ENTITIES)

export type WikiEntityType = z.infer<typeof WikiEntityTypeSchema>
