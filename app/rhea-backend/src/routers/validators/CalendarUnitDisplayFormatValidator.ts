import { CalendarUnitDisplayFormat } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf.js'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const CalendarUnitDisplayFormatValidator = RequiredParam({
	prevalidate: (v) => keysOf(CalendarUnitDisplayFormat).some((type) => type === (v ?? '')),
	parse: (v) => (v ?? '') as CalendarUnitDisplayFormat,
	description: `Calendar unit display format. Should be one of the following: ${keysOf(
		CalendarUnitDisplayFormat,
	)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
