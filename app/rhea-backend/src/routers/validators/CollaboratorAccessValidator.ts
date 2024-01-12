import { CollaboratorAccess } from '@prisma/client'
import { keysOf } from '@src/utils/keysOf'
import { RequiredParam } from 'tenebrie-framework'

export const CollaboratorAccessValidator = RequiredParam({
	prevalidate: (v) => keysOf(CollaboratorAccess).some((type) => type === (v ?? '')),
	rehydrate: (v) => (v ?? '') as CollaboratorAccess,
	description: `Collaborator access level. Should be one of the following: ${keysOf(CollaboratorAccess)
		.map((type) => `'${type}'`)
		.join(', ')}`,
})
