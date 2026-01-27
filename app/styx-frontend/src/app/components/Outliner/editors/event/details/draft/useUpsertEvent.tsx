import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { useUpdateEvent } from '@/app/views/world/api/useUpdateEvent'

import { EventDraft } from './useEventDraft'

type Props = {
	draft: EventDraft
}

export const useUpsertEvent = (props: Props) => {
	const { draft: baseDraft } = props
	const [updateEvent, { isLoading: isUpdating }] = useUpdateEvent()

	const draftRef = useAutoRef(baseDraft)

	const { flushSave, autosave } = useAutosave({
		onSave: async ({ draft }: Props) => {
			if (!draft.isDirty) {
				return
			}
			draft.setDirty(false)
			await updateEvent(draft.id, draft.toPayload())
		},
		isSaving: isUpdating,
	})

	useEffect(() => {
		if (baseDraft.id !== draftRef.previous?.id) {
			flushSave()
		} else if (baseDraft.isDirty) {
			autosave(props)
		}
	}, [autosave, baseDraft, draftRef, flushSave, props])

	useEffect(() => {
		flushSave()
	}, [baseDraft.id, flushSave])
}
