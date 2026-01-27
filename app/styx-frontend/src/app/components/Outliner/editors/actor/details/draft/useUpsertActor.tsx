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
		onSave: async ({ draft }: Props) => {
			if (!draft.isDirty || !draft.name) {
				return
			}
			draft.setDirty(false)
			await updateActor(draft.id, draft.toPayload())
		},
		isSaving: isUpdating,
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
