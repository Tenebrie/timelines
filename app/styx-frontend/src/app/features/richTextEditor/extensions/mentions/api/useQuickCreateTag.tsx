import { useCreateTagMutation } from '@api/otherApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ingestTag } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useQuickCreateTag = () => {
	const worldId = useSelector(getWorldIdState)
	const [createTag] = useCreateTagMutation()

	const { addTag } = worldSlice.actions
	const dispatch = useDispatch()

	const quickCreateTag = useCallback(
		async ({ query }: { query: string }) => {
			if (query.length === 0) {
				return
			}

			const { response, error } = parseApiResponse(
				await createTag({
					worldId,
					body: {
						name: query,
					},
				}),
			)
			if (error) {
				return null
			}
			dispatch(addTag(ingestTag(response)))
			return response
		},
		[addTag, createTag, dispatch, worldId],
	)

	return quickCreateTag
}
