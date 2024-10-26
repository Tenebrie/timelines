import { WorldAccessMode } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'moonflower'

export const WorldAccessModeValidator = RequiredParam({
	prevalidate: (v) => keysOf(WorldAccessMode).some((type) => type === (v ?? '')),
	parse: (v) => (v ?? '') as WorldAccessMode,
	description: `World access mode. Should be one of the following: ${keysOf(WorldAccessMode)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
