import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

import { useBoxedWikiContent } from './useBoxedWikiContent'

export function useCurrentArticle() {
	const state = useParams({ from: '/world/$worldId/_world/wiki/_wiki/$articleId' })

	const id = state.articleId
	const { visibleEntities } = useBoxedWikiContent()

	const article = useMemo(() => {
		return visibleEntities?.find((a) => a.id === id)
	}, [visibleEntities, id])

	return {
		id,
		worldId: state.worldId,
		article,
	}
}
