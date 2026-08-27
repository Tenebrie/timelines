import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CreateTagApiArg, useCreateTagMutation } from '@/api/worldTagApi'
import { ingestTag } from '@/app/utils/ingestEntity'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useCreateTag() {
	const worldId = useSelector(getWorldIdState)
	const [createTag, state] = useCreateTagMutation()

	const { addTag } = worldSlice.actions
	const dispatch = useDispatch()

	const perform = useCallback(
		async (body: CreateTagApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await createTag({
					worldId,
					body,
				}),
			)
			if (error) {
				return
			}
			const tag = ingestTag(response)
			dispatch(addTag(tag))
			return tag
		},
		[addTag, createTag, dispatch, worldId],
	)

	return [perform, state] as const
}
