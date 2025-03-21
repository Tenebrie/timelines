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
			worldWikiApi.util.updateQueryData('getArticles', { worldId, parentId: data.parentId }, (draft) => {
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

	const upsertCachedArticle = (data: WikiArticle) => {
		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId, parentId: data.parentId }, (draft) => {
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
		// TODO: Fix, this is a bug for folders
		dispatch(
			worldWikiApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
				return draft.filter((article) => !articles.includes(article.id))
			}),
		)
	}

	return {
		updateCachedArticle,
		upsertCachedArticle,
		removeCachedArticles,
	}
}
