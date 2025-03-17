import { useGetArticlesQuery } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	parentId?: string | null | undefined
}

export const useListArticles = ({ parentId }: Props = {}) => {
	const worldId = useSelector(getWorldIdState)
	return useGetArticlesQuery(
		{ worldId, parentId },
		{
			skip: !worldId,
		},
	)
}
