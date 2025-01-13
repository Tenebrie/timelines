import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useGetWorldInfoQuery } from '@/api/worldDetailsApi'

import { worldSlice } from '../reducer'
import { getWorldStateLoaded } from '../selectors'

export const useLoadWorldInfo = (worldId: string) => {
	const { data } = useGetWorldInfoQuery(
		{
			worldId: worldId,
		},
		{
			refetchOnReconnect: true,
			refetchOnMountOrArgChange: true,
		},
	)

	const isLoaded = useSelector(getWorldStateLoaded)

	const { loadWorld } = worldSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		if (!data) {
			return
		}

		if (!Number.isFinite(Number(data.timeOrigin))) {
			throw new Error('Time origin too large!')
		}

		dispatch(
			loadWorld({
				world: data,
			}),
		)
	}, [data, dispatch, loadWorld])

	return {
		isLoaded,
	}
}
