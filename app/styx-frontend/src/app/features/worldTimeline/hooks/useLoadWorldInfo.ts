import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useGetWorldInfoQuery } from '@/api/worldDetailsApi'

import { worldSlice } from '../../world/reducer'
import { getWorldStateLoaded } from '../../world/selectors'
import { useListArticles } from '../../worldWiki/api/useListArticles'
import { wikiSlice } from '../../worldWiki/reducer'

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
	const { data: articles } = useListArticles()

	const isLoaded = useSelector(getWorldStateLoaded)

	const { loadWorld } = worldSlice.actions
	const { loadArticles } = wikiSlice.actions
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

	useEffect(() => {
		dispatch(loadArticles({ articles: articles ?? [] }))
	})

	return {
		isLoaded,
	}
}
