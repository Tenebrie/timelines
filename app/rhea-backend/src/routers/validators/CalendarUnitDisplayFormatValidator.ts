import { CalendarUnitFormatMode } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf.js'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const CalendarUnitFormatModeValidator = RequiredParam({
	prevalidate: (v) => keysOf(CalendarUnitFormatMode).some((type) => type === (v ?? '')),
	parse: (v) => (v ?? '') as CalendarUnitFormatMode,
	description: `Calendar unit display format. Should be one of the following: ${keysOf(CalendarUnitFormatMode)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
