import { worldWikiApi } from '@api/worldWikiApi'
import { useDispatch, useSelector } from 'react-redux'

import { WikiArticle } from '@/api/types/worldWikiTypes'
import { AppDispatch } from '@/app/store'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useArticleApiCache = () => {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()

	const updateCachedArticle = (data: Pick<WikiArticle, 'id'> & Partial<WikiArticle>) => {
		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
				return draft
					.map((article) => {
						if (article.id !== data.id) {
							return article
						}

						return {
							...article,
							...data,
						}
					})
					.sort((a, b) => a.position - b.position)
			}),
		)
	}

	const updateCachedArticlePosition = ({
		articleId,
		parentId,
		position,
	}: {
		articleId: string
		parentId?: null | string
		position: number
	}) => {
		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
				const movedArticle = draft.find((article) => article.id === articleId)
				if (!movedArticle) {
					return
				}

				const oldParent =
					movedArticle.parentId && draft.find((article) => article.id === movedArticle.parentId)

				// Remove from old parent's children if exists
				if (oldParent && oldParent.id !== parentId) {
					oldParent.children = oldParent.children.filter((child) => child.id !== movedArticle.id)
				}

				// Update the article's position and parent
				movedArticle.parentId = parentId
				movedArticle.position = position

				// If parent is being updated
				const newParent = parentId && draft.find((article) => article.id === parentId)
				if (newParent) {
					newParent.children = [...newParent.children, { ...movedArticle }]
				}

				draft.sort((a, b) => a.position - b.position)
			}),
		)
	}

	const upsertCachedArticle = (data: WikiArticle) => {
		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
				if (!draft.some((article) => article.id === data.id)) {
					draft.push(data)
					return draft
				}

				return draft.map((article) => {
					if (article.id !== data.id) {
						return article
					}

					return {
						...article,
						...data,
					}
				})
			}),
		)
	}

	const removeCachedArticles = (articles: string[]) => {
		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
				return draft.filter((article) => !articles.includes(article.id))
			}),
		)
	}

	return {
		updateCachedArticle,
		updateCachedArticlePosition,
		upsertCachedArticle,
		removeCachedArticles,
	}
}
