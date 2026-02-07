import { RequiredParam } from 'moonflower'
import { z } from 'zod'

const calendarPresentationUnitSchema = z.array(
	z.object({
		unitId: z.string(),
		formatString: z.string().default(''),
	}),
)

export const CalendarPresentationUnitValidator = RequiredParam({
	parse: (v) => JSON.parse(v!) as z.infer<typeof calendarPresentationUnitSchema>,
	description: 'List of presentation units with their format strings',
	errorMessage: 'Invalid calendar presentation units format',
})
