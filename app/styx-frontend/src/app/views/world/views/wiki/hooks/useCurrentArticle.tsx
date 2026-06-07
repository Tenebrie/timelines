import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

import { useBoxedWikiContent } from './useBoxedWikiContent'

export function useCurrentArticle() {
	const state = useParams({ from: '/world/$worldId/_world/wiki/_wiki/$articleId' })

	const id = state.articleId
	const entities = useBoxedWikiContent()

	const article = useMemo(() => {
		return entities?.find((a) => a.id === id)
	}, [entities, id])

	return {
		id,
		worldId: state.worldId,
		article,
	}
}
