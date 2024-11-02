import { useSelector } from 'react-redux'

import { useGetWorldEventTracksQuery } from '../../../../../../api/rheaApi'
import { getWorldState } from '../../../selectors'

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
