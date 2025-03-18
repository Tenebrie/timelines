import { CollaboratorAccess } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'moonflower/validators/ParamWrappers'

export const CollaboratorAccessValidator = RequiredParam({
	prevalidate: (v) => keysOf(CollaboratorAccess).some((type) => type === (v ?? '')),
	parse: (v) => (v ?? '') as CollaboratorAccess,
	description: `Collaborator access level. Should be one of the following: ${keysOf(CollaboratorAccess)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
