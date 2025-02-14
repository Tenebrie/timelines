import { useCreateEvent } from '@api/hooks/useCreateEvent'
import { useUpdateEvent } from '@api/hooks/useUpdateEvent'
import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'

import { WorldEvent } from '../../types'
import { EventDraft } from '../EventEditor/components/EventDetailsEditor/useEventFields'

type Props = {
	mode: 'create' | 'edit'
	draft: EventDraft
	onCreate?: (event: WorldEvent) => void
}

export const useUpsertEvent = ({ mode, draft, onCreate }: Props) => {
	const [createEvent, { isLoading: isCreating }] = useCreateEvent()
	const [updateEvent, { isLoading: isUpdating }] = useUpdateEvent()

	const modeRef = useAutoRef(mode)

	const { manualSave, autosave } = useAutosave({
		onSave: async () => {
			if (!draft.isDirty.current) {
				return
			}
			draft.setDirty(false)
			const hasSubstance = draft.name.trim().length > 0 || draft.description.trim().length > 0
			if (!hasSubstance) {
				return
			}
			if (modeRef.current === 'create') {
				const createdEvent = await createEvent(draft.toPayload())
				if (createdEvent) {
					onCreate?.(createdEvent)
				}
			} else {
				await updateEvent(draft.id, draft.toPayload())
			}
		},
		isSaving: isCreating || isUpdating,
	})

	useEffect(() => {
		if (draft.isDirty.current) {
			autosave()
		}
	}, [autosave, draft])
}
