import { CollaboratorAccess } from '@api/types/worldCollaboratorsTypes'
import { useCallback, useMemo } from 'react'

import { keysOf } from '@/app/utils/keysOf'

export const useCollaboratorAccess = () => {
	const data = useMemo<Record<CollaboratorAccess, undefined>>(
		() => ({
			ReadOnly: undefined,
			Editing: undefined,
		}),
		[],
	)

	const listAllLevels = useCallback(() => keysOf(data), [data])

	return {
		listAllLevels,
	}
}
