import { WikiArticle } from '@api/types/worldWikiTypes'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

export function useArticleCollapseControls(article: WikiArticle) {
	const { expandedFolders } = useSelector(
		getWikiPreferences,
		(a, b) => a.expandedFolders === b.expandedFolders,
	)

	const { collapseWikiFolder, uncollapseWikiFolder } = preferencesSlice.actions
	const dispatch = useDispatch()

	const collapsed = !expandedFolders.includes(article.id)

	const forceOpen = useCallback(() => {
		dispatch(uncollapseWikiFolder(article))
	}, [dispatch, uncollapseWikiFolder, article])

	const toggleOpen = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseWikiFolder(article))
		} else {
			dispatch(collapseWikiFolder(article))
		}
	}, [collapsed, dispatch, uncollapseWikiFolder, article, collapseWikiFolder])

	return {
		collapsed,
		forceOpen,
		toggleOpen,
	}
}
