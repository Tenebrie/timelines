import { useEffect } from 'react'

import { useAutoRef } from '@/app/hooks/useAutoRef'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { useUpdateTag as useUpdateTagApi } from '@/app/views/world/api/useUpdateTag'

import { TagDraft } from './useTagDraft'

type Props = {
	draft: TagDraft
}

export const useUpdateTag = (props: Props) => {
	const { draft: baseDraft } = props
	const [updateTag, { isLoading: isUpdating }] = useUpdateTagApi()

	const draftRef = useAutoRef(baseDraft)

	const { flushSave, autosave } = useAutosave({
		onSave: async () => {
			const draft = draftRef.current
			if (!draft.isDirty || !draft.name) {
				return
			}
			draft.setDirty(false)
			await updateTag(draft.id, draft.toPayload(), (tag) => {
				draft.resetUpdatedAt(tag.updatedAt)
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
	}, [autosave, baseDraft, draftRef, flushSave])

	useEffect(() => {
		flushSave()
	}, [baseDraft.id, flushSave])
}
