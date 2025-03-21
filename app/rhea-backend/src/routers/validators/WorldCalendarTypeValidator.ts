import { WorldCalendarType } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const WorldCalendarTypeValidator = RequiredParam({
	prevalidate: (v) => keysOf(WorldCalendarType).some((type) => type === (v ?? '').toUpperCase()),
	parse: (v) => (v ?? '').toUpperCase() as WorldCalendarType,
	description: `Event type. Should be one of the following: ${keysOf(WorldCalendarType)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
