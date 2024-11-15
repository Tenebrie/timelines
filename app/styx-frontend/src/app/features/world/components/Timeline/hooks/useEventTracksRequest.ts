import { useSelector } from 'react-redux'

import { useGetWorldEventTracksQuery } from '@/api/worldApi'
import { getWorldState } from '@/app/features/world/selectors'

export const useEventTracksRequest = () => {
	const { isLoaded, id: worldId } = useSelector(getWorldState)
	const { data } = useGetWorldEventTracksQuery(
		{
			worldId,
		},
		{
			skip: !isLoaded,
		},
	)

	return {
		tracks: data ?? [],
	}
}
