import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useVisibleTags = () => {
	const { tags, search } = useSelector(getWorldState, (a, b) => a.tags === b.tags && a.search === b.search)

	const visibleTags = useMemo(() => {
		if (search.query) {
			return search.results.tags
		}

		return tags
			.map((tag, index) => ({
				...tag,
				raw: tag,
				index,
			}))
			.sort((a, b) => a.index - b.index)
			.map((a) => a.raw)
	}, [search, tags])

	return visibleTags
}
