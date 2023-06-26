import { WorldCalendarType } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'tenebrie-framework'

export const WorldCalendarTypeValidator = RequiredParam({
	prevalidate: (v) => keysOf(WorldCalendarType).some((type) => type === (v ?? '').toUpperCase()),
	rehydrate: (v) => (v ?? '').toUpperCase() as WorldCalendarType,
	description: `Event type. Should be one of the following: ${keysOf(WorldCalendarType)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
