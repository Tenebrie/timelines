import { RequiredParam } from 'moonflower'
import { z } from 'zod'

// TODO: Check this validation not working?
// eslint-disable-next-line unused-imports/no-unused-vars
const calendarUnitChildSchema = z.array(
	z.object({
		childUnitId: z.string(),
		label: z.string().optional().nullable(),
		shortLabel: z.string().optional().nullable(),
		repeats: z.number().default(1),
	}),
)

export const CalendarUnitChildValidator = RequiredParam({
	// TODO: fix validation in Moonflower?
	parse: (v) => JSON.parse(v!) as z.infer<typeof calendarUnitChildSchema>,
	description: 'List of child calendar units with their labels and repeat counts',
	errorMessage: 'Invalid calendar unit children format',
})
