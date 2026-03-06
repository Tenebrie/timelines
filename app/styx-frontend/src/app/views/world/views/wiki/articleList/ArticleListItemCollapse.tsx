import { WikiArticle } from '@api/types/worldWikiTypes'
import IconButton from '@mui/material/IconButton'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

type Props = {
	article: WikiArticle
}

export function ArticleListItemCollapse({ article }: Props) {
	const { expandedFolders } = useSelector(
		getWikiPreferences,
		(a, b) => a.expandedFolders === b.expandedFolders,
	)

	const { collapseWikiFolder, uncollapseWikiFolder } = preferencesSlice.actions
	const dispatch = useDispatch()

	const collapsed = !expandedFolders.includes(article.id)

	const onToggleCollapse = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseWikiFolder(article))
		} else {
			dispatch(collapseWikiFolder(article))
		}
	}, [collapsed, dispatch, uncollapseWikiFolder, article, collapseWikiFolder])

	return (
		<>
			{article.children.length > 0 && (
				<IconButton color="secondary" sx={{ flexShrink: 0 }} onClick={onToggleCollapse}>
					<ShowHideChevron collapsed={collapsed} />
				</IconButton>
			)}
		</>
	)
}
