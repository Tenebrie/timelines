import { ActorDetails } from '@api/types/worldTypes'
import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { useCreateActor } from '@/app/views/world/api/useCreateActor'
import { useDeleteActor } from '@/app/views/world/api/useDeleteActor'
import { useUpdateActor } from '@/app/views/world/api/useUpdateActor'

import { ActorDraft } from './useActorDraft'

type Props = {
	mode: 'create' | 'edit'
	draft: ActorDraft
	onCreate?: (event: ActorDetails) => void
}

export const useUpsertActor = (props: Props) => {
	const { mode: baseMode, draft: baseDraft } = props
	const [createActor, { isLoading: isCreating }] = useCreateActor()
	const [updateActor, { isLoading: isUpdating }] = useUpdateActor()
	const [deleteActor, { isLoading: isDeleting }] = useDeleteActor()

	const draftRef = useAutoRef(baseDraft)

	const { flushSave, autosave } = useAutosave({
		onSave: async ({ draft, mode, onCreate }: Props) => {
			if (!draft.isDirty) {
				return
			}
			draft.setDirty(false)
			const hasSubstance = draft.name.trim().length > 0 || draft.description.trim().length > 0
			if (hasSubstance && mode === 'create') {
				const createdEvent = await createActor({
					...draft.toPayload(),
				})
				if (createdEvent) {
					onCreate?.(createdEvent)
				}
			} else if (hasSubstance && mode === 'edit') {
				await updateActor(draft.id, draft.toPayload())
			} else if (!hasSubstance && mode === 'edit') {
				await deleteActor(draft.id)
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
