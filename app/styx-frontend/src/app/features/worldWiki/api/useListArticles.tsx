import { useGetArticlesQuery } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '../../world/selectors'

export const useListArticles = () => {
	const worldId = useSelector(getWorldIdState)
	return useGetArticlesQuery(
		{ worldId },
		{
			skip: !worldId,
		},
	)
}
