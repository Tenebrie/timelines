import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { getWikiState } from '../WikiSliceSelectors'

export function useFolderItemCount(folderId: string) {
	const { articles, folders } = useSelector(
		getWikiState,
		(a, b) => a.articles === b.articles && a.folders === b.folders,
	)
	const { actors, events, tags } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.events === b.events && a.tags === b.tags,
	)

	return useMemo(
		() =>
			[...articles, ...folders, ...actors, ...events, ...tags].filter((e) => e.parentFolderId === folderId)
				.length,
		[articles, folders, actors, events, tags, folderId],
	)
}
