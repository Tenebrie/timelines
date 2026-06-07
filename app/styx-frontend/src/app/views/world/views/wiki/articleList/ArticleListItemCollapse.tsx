import IconButton from '@mui/material/IconButton'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'

type Props = {
	entity: BoxedWikiEntity
}

export function ArticleListItemCollapse({ entity }: Props) {
	const { expandedFolders } = useSelector(
		getWikiPreferences,
		(a, b) => a.expandedFolders === b.expandedFolders,
	)

	const { collapseWikiFolder, uncollapseWikiFolder } = preferencesSlice.actions
	const dispatch = useDispatch()

	const collapsed = !expandedFolders.includes(entity.id)

	const onToggleCollapse = useCallback(() => {
		if (collapsed) {
			dispatch(uncollapseWikiFolder(entity))
		} else {
			dispatch(collapseWikiFolder(entity))
		}
	}, [collapsed, dispatch, uncollapseWikiFolder, entity, collapseWikiFolder])

	return (
		<>
			{entity.type === 'folder' && (
				<IconButton color="secondary" sx={{ flexShrink: 0 }} onClick={onToggleCollapse}>
					<ShowHideChevron collapsed={collapsed} />
				</IconButton>
			)}
		</>
	)
}
