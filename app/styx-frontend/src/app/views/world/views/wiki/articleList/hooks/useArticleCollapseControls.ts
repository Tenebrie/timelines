import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { RootState } from '@/app/store'

export function useArticleCollapseControls(article: { id: string | null }) {
	const collapsed = useSelector(
		(state: RootState) => !!article.id && !getWikiPreferences(state).expandedFolders.includes(article.id),
	)

	const { collapseWikiFolderById, uncollapseWikiFolderById } = preferencesSlice.actions
	const dispatch = useDispatch()

	const forceOpen = useCallback(() => {
		if (!article.id) {
			return
		}
		dispatch(uncollapseWikiFolderById(article.id))
	}, [dispatch, uncollapseWikiFolderById, article])

	const toggleOpen = useCallback(() => {
		if (!article.id) {
			return
		}
		if (collapsed) {
			dispatch(uncollapseWikiFolderById(article.id))
		} else {
			dispatch(collapseWikiFolderById(article.id))
		}
	}, [collapsed, dispatch, uncollapseWikiFolderById, article, collapseWikiFolderById])

	return {
		collapsed,
		forceOpen,
		toggleOpen,
	}
}
