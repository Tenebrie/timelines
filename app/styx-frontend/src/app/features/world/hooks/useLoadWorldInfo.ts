import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useGetWorldInfoQuery } from '../../../../api/rheaApi'
import { worldSlice } from '../reducer'
import { getWorldState } from '../selectors'

export const useLoadWorldInfo = (worldId: string) => {
	const { data } = useGetWorldInfoQuery({
		worldId: worldId,
	})

	const { isLoaded } = useSelector(getWorldState)

	const { loadWorld } = worldSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		if (!data) {
			return
		}

		if (!Number.isFinite(Number(data.timeOrigin))) {
			throw new Error('Time origin too large!')
		}

		dispatch(loadWorld(data))
	}, [data, dispatch, loadWorld])

	return {
		isLoaded,
	}
}
