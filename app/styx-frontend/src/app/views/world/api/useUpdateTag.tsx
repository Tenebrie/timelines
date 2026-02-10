import { useUpdateTagMutation } from '@api/otherApi'
import { WorldTag } from '@api/types/worldTypes'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ingestTag } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

type UpdateTagBody = {
	name?: string
}

export const useUpdateTag = () => {
	const worldId = useSelector(getWorldIdState)
	const [updateWorldTag, state] = useUpdateTagMutation()

	const { updateTag } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, body: UpdateTagBody, onBeforeSave?: (tag: WorldTag) => void) => {
			const { response, error } = parseApiResponse(
				await updateWorldTag({
					worldId,
					tagId: id,
					body,
				}),
			)
			if (error) {
				return
			}

			const tag = ingestTag(response)
			onBeforeSave?.(tag)

			dispatch(updateTag(tag))

			return tag
		},
		[dispatch, updateTag, updateWorldTag, worldId],
	)

	return [perform, state] as const
}
