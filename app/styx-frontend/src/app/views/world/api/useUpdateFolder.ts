import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useWikiApiCache } from '@/api/hooks/useWikiApiCache'
import { UpdateArticleApiArg } from '@/api/otherApi'
import { worldDetailsApi } from '@/api/worldDetailsApi'
import { useGetFoldersQuery, useUpdateFolderMutation } from '@/api/worldWikiFolderApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useUpdateFolder() {
	const worldId = useSelector(getWorldIdState)
	const { data: folders = [] } = useGetFoldersQuery({ worldId })
	const [updateFolder, state] = useUpdateFolderMutation()
	const { updateCachedFolder } = useWikiApiCache()

	const dispatch = useDispatch()

	const perform = useCallback(
		async (id: string, body: UpdateArticleApiArg['body']) => {
			const diff = updateCachedFolder({ ...body, id })

			const { response, error } = parseApiResponse(
				await updateFolder({
					worldId,
					folderId: id,
					body,
				}),
			)
			if (error) {
				diff.undo()
				return
			}

			// Invalidate common icons query cache if icon has changed
			const oldIcon = folders.find((e) => e.id === id)?.icon
			if (body.icon !== undefined && body.icon !== oldIcon) {
				dispatch(worldDetailsApi.util.invalidateTags([{ type: 'worldCommonIcons' }]))
			}

			updateCachedFolder(response)

			return response
		},
		[folders, dispatch, updateFolder, updateCachedFolder, worldId],
	)

	return [perform, state] as const
}
