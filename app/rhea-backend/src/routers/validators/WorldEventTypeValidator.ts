import { WorldEventType } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'tenebrie-framework'

export const WorldEventTypeValidator = RequiredParam({
	prevalidate: (v) => keysOf(WorldEventType).some((type) => type === v.toUpperCase()),
	rehydrate: (v) => v.toUpperCase() as WorldEventType,
	description: `Event type. Should be one of the following: ${keysOf(WorldEventType)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
