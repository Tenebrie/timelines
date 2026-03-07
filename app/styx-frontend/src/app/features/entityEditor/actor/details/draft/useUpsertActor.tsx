import { ActorDetails } from '@api/types/worldTypes'
import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { useUpdateActor } from '@/app/views/world/api/useUpdateActor'

import { ActorDraft } from './useActorDraft'

type Props = {
	mode: 'create' | 'edit'
	draft: ActorDraft
	onCreate?: (event: ActorDetails) => void
}

export const useUpsertActor = (props: Props) => {
	const { mode: baseMode, draft: baseDraft } = props
	const [updateActor, { isLoading: isUpdating }] = useUpdateActor()

	const draftRef = useAutoRef(baseDraft)

	const { flushSave, autosave } = useAutosave({
		onSave: async () => {
			const draft = draftRef.current
			if (!draft.isDirty || !draft.name) {
				return
			}
			draft.setDirty(false)
			await updateActor(draft.id, draft.toPayload(), (actor) => {
				draft.resetUpdatedAt(actor.updatedAt)
			})
		},
		isSaving: isUpdating,
	})

	useEffect(() => {
		if (baseDraft.id !== draftRef.previous?.id) {
			flushSave()
		} else if (baseDraft.isDirty) {
			autosave()
		}
	}, [autosave, baseDraft, baseMode, draftRef, flushSave])

	useEffect(() => {
		flushSave()
	}, [baseDraft.id, flushSave])
}
