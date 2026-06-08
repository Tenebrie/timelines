import { WikiArticle, WikiPositionUpdate } from '@api/types/worldWikiTypes'
import { worldDetailsApi } from '@api/worldDetailsApi'
import { worldWikiApi } from '@api/worldWikiApi'
import { worldWikiFolderApi } from '@api/worldWikiFolderApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useWikiApiCache() {
	const dispatch = useDispatch<AppDispatch>()
	const worldId = useSelector(getWorldIdState)

	const upsertCachedArticle = useCallback(
		(article: WikiArticle) => {
			dispatch(
				worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
					const index = draft.findIndex((a) => a.id === article.id)
					if (index >= 0) {
						draft[index] = article
					} else {
						draft.push(article)
					}
				}),
			)
		},
		[dispatch, worldId],
	)

	const applyPositionUpdates = useCallback(
		(updates: WikiPositionUpdate[]) => {
			function applyToEntity(
				entity: { parentFolderId?: null | string; parentFolderPosition: number } | undefined,
				update: WikiPositionUpdate,
			) {
				if (!entity) return
				if (update.folderId !== undefined) {
					entity.parentFolderId = update.folderId
				}
				entity.parentFolderPosition = update.position
			}

			const articleUpdates = updates.filter((u) => u.entityType === 'article')
			const folderUpdates = updates.filter((u) => u.entityType === 'folder')
			const worldEntityUpdates = updates.filter(
				(u) => u.entityType === 'actor' || u.entityType === 'event' || u.entityType === 'tag',
			)

			if (articleUpdates.length > 0) {
				dispatch(
					worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
						articleUpdates.forEach((update) => {
							applyToEntity(
								draft.find((a) => a.id === update.entityId),
								update,
							)
						})
					}),
				)
			}

			if (folderUpdates.length > 0) {
				dispatch(
					worldWikiFolderApi.util.updateQueryData('getFolders', { worldId }, (draft) => {
						folderUpdates.forEach((update) => {
							const folder =
								draft.find((f) => f.id === update.entityId) ??
								draft.flatMap((f) => f.children).find((c) => c.id === update.entityId)
							applyToEntity(folder, update)
						})
					}),
				)
			}

			if (worldEntityUpdates.length > 0) {
				dispatch(
					worldDetailsApi.util.updateQueryData('getWorldInfo', { worldId }, (draft) => {
						const collections = {
							actor: draft.actors,
							event: draft.events,
							tag: draft.tags,
						} as const
						worldEntityUpdates.forEach((update) => {
							const collection = collections[update.entityType as keyof typeof collections]
							applyToEntity(
								collection?.find((e) => e.id === update.entityId),
								update,
							)
						})
					}),
				)
			}
		},
		[dispatch, worldId],
	)

	return { upsertCachedArticle, applyPositionUpdates }
}
