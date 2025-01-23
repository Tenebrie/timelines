import { MentionedEntity } from '@prisma/client'
import { RequiredParam } from 'moonflower'
import { z } from 'zod'

const zodSchema = z.array(
	z.object({
		targetId: z.string(),
		targetType: z.nativeEnum(MentionedEntity),
	}),
)

export type MentionsArray = z.infer<typeof zodSchema>

export const MentionsArrayValidator = RequiredParam({
	parse: (v) => {
		try {
			return zodSchema.parse(JSON.parse(v ?? ''))
		} catch (error) {
			console.error(error)
			throw error
		}
	},
	description: 'An array of objects with an id and type field',
	errorMessage: 'Must be an array of objects with an id and type field',
})
