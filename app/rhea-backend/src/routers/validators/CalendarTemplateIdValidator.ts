import {
	CalendarTemplateId,
	CalendarTemplateIdShape,
	SupportedCalendarTemplates,
} from '@src/services/CalendarTemplateService.js'
import { keysOf } from '@src/utils/keysOf.js'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const CalendarTemplateIdValidator = RequiredParam<CalendarTemplateId>({
	parse: CalendarTemplateIdShape.parse,
	description: `World access mode. Should be one of the following: ${keysOf(SupportedCalendarTemplates)
		.map((type) => `'${String(type)}'`)
		.join(', ')}`,
})
