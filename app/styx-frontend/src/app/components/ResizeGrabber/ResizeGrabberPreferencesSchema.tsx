import { z } from 'zod'

export const ResizeGrabberPreferencesSchema = z.object({
	height: z.number(),
	visible: z.boolean(),
})
