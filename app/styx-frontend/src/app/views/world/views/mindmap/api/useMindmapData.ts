import { GetMindmapApiResponse, useGetMindmapQuery } from '@api/mindmapApi'
import { useSelector } from 'react-redux'

import { getWorldState } from '../../../WorldSliceSelectors'

export function useMindmapData() {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })
	if (!data) {
		return {
			nodes: [],
			wires: [],
		} as GetMindmapApiResponse
	}

	return data
}
