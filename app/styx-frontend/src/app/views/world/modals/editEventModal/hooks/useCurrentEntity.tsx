import { useModal } from '@/app/features/modals/ModalsSlice'

import { useEntityResolver } from './useEntityResolver'

export function useCurrentEntity() {
	const { entityStack, creatingNew: isCreatingNew } = useModal('editEventModal')
	const { resolveEntity } = useEntityResolver()

	if (isCreatingNew) {
		return { type: isCreatingNew, entity: null } as const
	}

	if (entityStack.length === 0) {
		return null
	}

	const latestEntityId = entityStack[entityStack.length - 1]
	return resolveEntity(latestEntityId)
}
