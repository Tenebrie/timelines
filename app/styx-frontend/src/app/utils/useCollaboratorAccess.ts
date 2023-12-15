import { useCallback, useMemo } from 'react'

import { CollaboratorAccess } from '../../api/types'
import { keysOf } from './keysOf'

export const useCollaboratorAccess = () => {
	const data = useMemo<Record<CollaboratorAccess, undefined>>(
		() => ({
			Editing: undefined,
			ReadOnly: undefined,
		}),
		[]
	)

	const listAllLevels = useCallback(() => keysOf(data), [data])

	return {
		listAllLevels,
	}
}
