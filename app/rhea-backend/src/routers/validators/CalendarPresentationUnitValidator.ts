import { RequiredParam } from 'moonflower'
import { z } from 'zod'

const calendarPresentationUnitSchema = z.array(
	z.object({
		unitId: z.string(),
		formatString: z.string().default(''),
		subdivision: z.number().int().min(1).optional(),
	}),
)

export const CalendarPresentationUnitValidator = RequiredParam({
	parse: (v) => JSON.parse(v!) as z.infer<typeof calendarPresentationUnitSchema>,
	description: 'List of presentation units with their format strings and subdivisions',
	errorMessage: 'Invalid calendar presentation units format',
})
