import { WikiArticle } from '@api/types/worldWikiTypes'
import { ChangeEvent, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useListArticles } from '@/app/views/world/api/useListArticles'
import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'

type Props = {
	article: WikiArticle
}

export const useArticleBulkActions = ({ article }: Props) => {
	const { data: articles } = useListArticles()
	const { isBulkSelecting, lastCheckedArticle, bulkActionArticles } = useSelector(getWikiState)

	const { setLastCheckedArticle, addToBulkSelection, removeFromBulkSelection } = wikiSlice.actions
	const dispatch = useDispatch()

	const checked = useMemo(() => bulkActionArticles.includes(article.id), [bulkActionArticles, article.id])

	const onChange = useCallback(
		(event: ChangeEvent, checked: boolean) => {
			if (!articles) {
				return
			}

			const isBulk =
				event.nativeEvent instanceof MouseEvent && event.nativeEvent.shiftKey && lastCheckedArticle

			if (checked) {
				dispatch(addToBulkSelection({ articles: [article.id] }))
			} else {
				dispatch(removeFromBulkSelection({ articles: [article.id] }))
			}

			const sortedArticles = [...articles].sort((a, b) => a.position - b.position)

			if (isBulk) {
				const lastCheckedIndex = sortedArticles.indexOf(
					sortedArticles.find((a) => a.id === lastCheckedArticle)!,
				)
				const currentIndex = sortedArticles.indexOf(sortedArticles.find((a) => a.id === article.id)!)

				const [start, end] =
					lastCheckedIndex < currentIndex
						? [lastCheckedIndex, currentIndex]
						: [currentIndex, lastCheckedIndex]

				const adjustSelection = checked ? addToBulkSelection : removeFromBulkSelection

				dispatch(adjustSelection({ articles: sortedArticles.slice(start, end + 1).map((a) => a.id) }))
			} else {
				dispatch(setLastCheckedArticle({ article: article.id }))
			}
		},
		[
			addToBulkSelection,
			article.id,
			articles,
			dispatch,
			lastCheckedArticle,
			removeFromBulkSelection,
			setLastCheckedArticle,
		],
	)

	return {
		checkboxVisible: isBulkSelecting,
		checked,
		onChange,
	}
}
