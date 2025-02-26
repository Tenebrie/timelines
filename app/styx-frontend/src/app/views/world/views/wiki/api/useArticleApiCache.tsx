import { otherApi } from '@api/otherApi'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '@/app/store'
import { WikiArticle } from '@/app/views/world/views/wiki/types'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useArticleApiCache = () => {
	const worldId = useSelector(getWorldIdState)
	const dispatch = useDispatch<AppDispatch>()

	const updateCachedArticle = (data: Pick<WikiArticle, 'id'> & Partial<WikiArticle>) => {
		dispatch(
			otherApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
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
			otherApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
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
			otherApi.util.updateQueryData('getArticles', { worldId }, (draft) => {
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
