import { useMatches } from '@tanstack/react-router'
import { ChangeEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getVisibleOrderedWikiEntityIds, getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'

import { BoxedWikiEntity } from './useBoxedWikiContent'

export const useArticleBulkActions = () => {
	const { isBulkSelecting, lastCheckedArticle, bulkActionArticles } = useSelector(
		getWikiState,
		(a, b) =>
			a.isBulkSelecting === b.isBulkSelecting &&
			a.lastCheckedArticle === b.lastCheckedArticle &&
			a.bulkActionArticles === b.bulkActionArticles,
	)
	const orderedIds = useSelector(getVisibleOrderedWikiEntityIds)
	const openArticleId = useOpenArticleId()

	const { setLastCheckedArticle, addToBulkSelection, removeFromBulkSelection } = wikiSlice.actions
	const dispatch = useDispatch()

	const isChecked = useCallback(
		(article: BoxedWikiEntity) => bulkActionArticles.includes(article.id),
		[bulkActionArticles],
	)

	const onChange = useEvent((article: BoxedWikiEntity, event: ChangeEvent<HTMLInputElement>) => {
		const checked = event.target.checked

		const isRange =
			event.nativeEvent instanceof MouseEvent && event.nativeEvent.shiftKey && !!lastCheckedArticle

		if (checked) {
			dispatch(addToBulkSelection({ articles: [article.id] }))
		} else {
			dispatch(removeFromBulkSelection({ articles: [article.id] }))
		}

		if (isRange) {
			const range = rangeBetween(orderedIds, lastCheckedArticle, article.id)
			dispatch((checked ? addToBulkSelection : removeFromBulkSelection)({ articles: range }))
		} else {
			dispatch(setLastCheckedArticle({ article: article.id }))
		}
	})

	const onShiftSelect = useEvent((targetId: string) => {
		const anchor = lastCheckedArticle ?? openArticleId
		const range = anchor ? rangeBetween(orderedIds, anchor, targetId) : []

		// No usable anchor (nothing open / anchor scrolled out of view) — start a fresh selection at the target.
		dispatch(addToBulkSelection({ articles: range.length > 0 ? range : [targetId] }))
	})

	return {
		checkboxVisible: isBulkSelecting,
		isChecked,
		onChange,
		onShiftSelect,
	}
}

function useOpenArticleId(): string | null {
	const matches = useMatches()
	const match = matches.find((match) => match.routeId === '/world/$worldId/_world/wiki/_wiki/$articleId')
	return match ? (match.params as { articleId: string }).articleId : null
}

function rangeBetween(orderedIds: string[], anchorId: string, targetId: string): string[] {
	const anchorIndex = orderedIds.indexOf(anchorId)
	const targetIndex = orderedIds.indexOf(targetId)
	if (anchorIndex === -1 || targetIndex === -1) {
		return []
	}
	const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex]
	return orderedIds.slice(start, end + 1)
}
