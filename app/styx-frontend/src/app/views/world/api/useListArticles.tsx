import { useGetArticlesQuery } from '@api/worldWikiApi'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export const useListArticles = () => {
	const worldId = useSelector(getWorldIdState)
	return useGetArticlesQuery(
		{ worldId },
		{
			skip: !worldId,
		},
	)
}
