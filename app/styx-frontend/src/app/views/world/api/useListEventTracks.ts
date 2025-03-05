import { useSelector } from 'react-redux'

import { useGetWorldEventTracksQuery } from '@/api/worldEventTracksApi'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useListEventTracks = () => {
	const { isLoaded, id: worldId } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.isLoaded === b.isLoaded,
	)
	const state = useGetWorldEventTracksQuery(
		{
			worldId,
		},
		{
			skip: !isLoaded,
			refetchOnMountOrArgChange: true,
		},
	)

	return state
}
