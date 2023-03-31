import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useGetWorldInfoQuery } from '../../../../api/rheaApi'
import { worldSlice } from '../reducer'

export const useLoadWorldInfo = (worldId: string) => {
	const { data } = useGetWorldInfoQuery({
		worldId: worldId,
	})

	const { loadWorld } = worldSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		if (!data) {
			return
		}

		dispatch(loadWorld(data))
	}, [data, dispatch, loadWorld])
}
