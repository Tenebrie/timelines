import { AnyRouteMatch, useRouter } from '@tanstack/react-router'
import { useDispatch, useSelector, useStore } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { RootState } from '@/app/store'
import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getVisibleOrderedWikiEntities } from '@/app/views/world/views/wiki/WikiSliceSelectors'

import { BoxedWikiEntity } from './useBoxedWikiContent'

export const useArticleBulkActions = (article: BoxedWikiEntity) => {
	const dispatch = useDispatch()
	const store = useStore<RootState>()
	const router = useRouter()
	const { setLastCheckedArticle, addToBulkSelection, removeFromBulkSelection } = wikiSlice.actions

	const isBulkSelecting = useSelector((state: RootState) => state.wiki.isBulkSelecting)
	const checked = useSelector((state: RootState) => state.wiki.bulkActionArticles.includes(article.id))
	const isSelectionHead = useSelector(
		(state: RootState) => state.wiki.isBulkSelecting && state.wiki.lastCheckedArticle === article.id,
	)

	function applySelection(state: RootState, nextChecked: boolean, shiftRange: boolean) {
		const action = nextChecked ? addToBulkSelection : removeFromBulkSelection
		dispatch(action({ articles: [article.id] }))

		const anchor = state.wiki.lastCheckedArticle
		if (shiftRange && anchor) {
			const range = rangeBetween(getVisibleOrderedWikiEntities(state), anchor, article.id)
			dispatch(action({ articles: range }))
		}

		dispatch(setLastCheckedArticle({ article: article.id }))
	}

	const onRowToggle = useEvent((event: { shiftKey: boolean }) => {
		const state = store.getState()

		if (!state.wiki.isBulkSelecting) {
			const openArticleId = getOpenArticleId(router.state.matches)
			if (openArticleId && openArticleId !== article.id) {
				dispatch(addToBulkSelection({ articles: [openArticleId] }))
			}
		}

		applySelection(state, !state.wiki.bulkActionArticles.includes(article.id), event.shiftKey)
	})

	const onShiftSelect = useEvent(() => {
		const state = store.getState()
		const anchor = state.wiki.lastCheckedArticle ?? getOpenArticleId(router.state.matches)
		const range = anchor ? rangeBetween(getVisibleOrderedWikiEntities(state), anchor, article.id) : []

		dispatch(addToBulkSelection({ articles: range.length > 0 ? range : [article.id] }))
		dispatch(setLastCheckedArticle({ article: article.id }))
	})

	return {
		isBulkSelecting,
		checked,
		isSelectionHead,
		onRowToggle,
		onShiftSelect,
	}
}

function getOpenArticleId(matches: AnyRouteMatch[]): string | null {
	const match = matches.find((match) => match.routeId === '/world/$worldId/_world/wiki/_wiki/$articleId')
	return match ? (match.params as { articleId: string }).articleId : null
}

function rangeBetween(
	ordered: { id: string; parentId: string | null }[],
	anchorId: string,
	targetId: string,
): string[] {
	const anchorIndex = ordered.findIndex((entity) => entity.id === anchorId)
	const targetIndex = ordered.findIndex((entity) => entity.id === targetId)
	if (anchorIndex === -1 || targetIndex === -1) {
		return []
	}
	const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex]
	const slice = ordered.slice(start, end + 1)
	const inRange = new Set(slice.map((entity) => entity.id))
	// Skip entities whose folder is itself in the range — selecting a folder already moves its contents.
	return slice.filter((entity) => !inRange.has(entity.parentId ?? '')).map((entity) => entity.id)
}
