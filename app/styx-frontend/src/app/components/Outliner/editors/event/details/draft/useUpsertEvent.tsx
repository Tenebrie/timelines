import { WorldEvent } from '@api/types/worldTypes'
import { useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { useCreateEvent } from '@/app/views/world/api/useCreateEvent'
import { useUpdateEvent } from '@/app/views/world/api/useUpdateEvent'

import { EventDraft } from './useEventDraft'

type Props = {
	mode: 'create' | 'edit'
	draft: EventDraft
	onCreate?: (event: WorldEvent) => void
}

export const useUpsertEvent = (props: Props) => {
	const { mode: baseMode, draft: baseDraft } = props
	const [createEvent, { isLoading: isCreating }] = useCreateEvent()
	const [updateEvent, { isLoading: isUpdating }] = useUpdateEvent()

	const draftRef = useAutoRef(baseDraft)

	const targetTrack = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.track,
	})

	const { flushSave, autosave } = useAutosave({
		onSave: async ({ draft, mode, onCreate }: Props) => {
			if (!draft.isDirty) {
				return
			}
			draft.setDirty(false)
			const hasSubstance =
				(draft.name.trim().length > 0 && draft.customNameEnabled) || draft.description.trim().length > 0
			if (hasSubstance && mode === 'create') {
				const createdEvent = await createEvent({
					...draft.toPayload(),
					worldEventTrackId: targetTrack,
				})
				if (createdEvent) {
					onCreate?.(createdEvent)
				}
			} else if (hasSubstance && mode === 'edit') {
				await updateEvent(draft.id, draft.toPayload())
			}
		},
		isSaving: isCreating || isUpdating,
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
