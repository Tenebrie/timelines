import { useCreateEvent } from '@api/hooks/useCreateEvent'
import { useDeleteEvent } from '@api/hooks/useDeleteEvent'
import { useUpdateEvent } from '@api/hooks/useUpdateEvent'
import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'

import { EventDraft } from '../components/EventEditor/components/EventDetailsEditor/useEventFields'
import { WorldEvent } from '../types'

type Props = {
	mode: 'create' | 'edit'
	draft: EventDraft
	onCreate?: (event: WorldEvent) => void
}

export const useUpsertEvent = (props: Props) => {
	const { mode: baseMode, draft: baseDraft } = props
	const [createEvent, { isLoading: isCreating }] = useCreateEvent()
	const [updateEvent, { isLoading: isUpdating }] = useUpdateEvent()
	const [deleteEvent, { isLoading: isDeleting }] = useDeleteEvent()

	const draftRef = useAutoRef(baseDraft)

	const { flushSave, autosave } = useAutosave({
		onSave: async ({ draft, mode, onCreate }: Props) => {
			if (!draft.isDirty) {
				return
			}
			draft.setDirty(false)
			const hasSubstance =
				(draft.name.trim().length > 0 && draft.customNameEnabled) || draft.description.trim().length > 0
			if (hasSubstance && mode === 'create') {
				const createdEvent = await createEvent(draft.toPayload())
				if (createdEvent) {
					onCreate?.(createdEvent)
				}
			} else if (hasSubstance && mode === 'edit') {
				await updateEvent(draft.id, draft.toPayload())
			} else if (!hasSubstance && mode === 'edit') {
				await deleteEvent(draft.id)
			}
		},
		isSaving: isCreating || isUpdating || isDeleting,
	})

	useEffect(() => {
		if (baseDraft.id !== draftRef.previous?.id) {
			flushSave()
		} else if (baseDraft.isDirty) {
			autosave(props)
		}
	}, [autosave, baseDraft, baseMode, draftRef, flushSave, props])

	useEffect(() => {
		flushSave()
	}, [baseDraft.id, flushSave])
}
