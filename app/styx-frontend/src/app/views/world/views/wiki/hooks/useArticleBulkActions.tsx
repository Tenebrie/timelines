import { ChangeEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'

import { BoxedWikiEntity } from './useBoxedWikiContent'

type Props = {
	articles: BoxedWikiEntity[]
}

export const useArticleBulkActions = ({ articles }: Props) => {
	const { isBulkSelecting, lastCheckedArticle, bulkActionArticles } = useSelector(
		getWikiState,
		(a, b) =>
			a.isBulkSelecting === b.isBulkSelecting &&
			a.lastCheckedArticle === b.lastCheckedArticle &&
			a.bulkActionArticles === b.bulkActionArticles,
	)

	const { setLastCheckedArticle, addToBulkSelection, removeFromBulkSelection } = wikiSlice.actions
	const dispatch = useDispatch()

	const isChecked = useCallback(
		(article: BoxedWikiEntity) => bulkActionArticles.includes(article.id),
		[bulkActionArticles],
	)

	const onChange = useEvent((article: BoxedWikiEntity, event: ChangeEvent<HTMLInputElement>) => {
		if (!articles) {
			return
		}
		const checked = event.target.checked

		const isBulk = event.nativeEvent instanceof MouseEvent && event.nativeEvent.shiftKey && lastCheckedArticle

		if (checked) {
			dispatch(addToBulkSelection({ articles: [article.id] }))
		} else {
			dispatch(removeFromBulkSelection({ articles: [article.id] }))
		}

		if (isBulk) {
			const lastCheckedIndex = articles.indexOf(articles.find((a) => a.id === lastCheckedArticle)!)
			const currentIndex = articles.indexOf(articles.find((a) => a.id === article.id)!)

			const [start, end] =
				lastCheckedIndex < currentIndex ? [lastCheckedIndex, currentIndex] : [currentIndex, lastCheckedIndex]

			const adjustSelection = checked ? addToBulkSelection : removeFromBulkSelection

			dispatch(adjustSelection({ articles: articles.slice(start, end + 1).map((a) => a.id) }))
		} else {
			dispatch(setLastCheckedArticle({ article: article.id }))
		}
	})

	return {
		checkboxVisible: isBulkSelecting,
		isChecked,
		onChange,
	}
}
