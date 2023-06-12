import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useGetWorldInfoQuery } from '../../../../api/rheaApi'
import { worldSlice } from '../reducer'
import { getWorldState } from '../selectors'
import { useActorColors } from './useActorColors'

export const useLoadWorldInfo = (worldId: string) => {
	const { data } = useGetWorldInfoQuery({
		worldId: worldId,
	})

	const { listAllColors } = useActorColors()
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

		dispatch(
			loadWorld({
				world: {
					...data,
					events: data.events.map((e) => ({
						...e,
						timestamp: Number(e.timestamp),
					})),
				},
				actorColors: listAllColors().map((color) => color.value),
			})
		)
	}, [data, dispatch, listAllColors, loadWorld])

	return {
		isLoaded,
	}
}
