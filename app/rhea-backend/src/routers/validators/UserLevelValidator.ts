import { UserLevel } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const UserLevelValidator = RequiredParam({
	prevalidate: (v) => keysOf(UserLevel).some((type) => type === (v ?? '')),
	parse: (v) => (v ?? '') as UserLevel,
	description: `UserLevel. Should be one of the following: ${keysOf(UserLevel)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
