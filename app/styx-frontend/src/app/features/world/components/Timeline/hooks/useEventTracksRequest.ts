import { useSelector } from 'react-redux'

import { useGetWorldEventTracksQuery } from '@/api/worldEventTracksApi'
import { getWorldState } from '@/app/features/world/selectors'

export const useEventTracksRequest = () => {
	const { isLoaded, id: worldId } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.isLoaded === b.isLoaded,
	)
	const { data } = useGetWorldEventTracksQuery(
		{
			worldId,
		},
		{
			skip: !isLoaded,
			refetchOnMountOrArgChange: true,
		},
	)

	return {
		tracks: data ?? [],
	}
}
