import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useGetWorldInfoQuery } from '@/api/worldDetailsApi'

import { useListArticles } from '../api/useListArticles'
import { wikiSlice } from '../views/wiki/WikiSlice'
import { worldSlice } from '../WorldSlice'
import { getWorldStateLoaded } from '../WorldSliceSelectors'

export const useLoadWorldInfo = (worldId: string) => {
	const { data, error } = useGetWorldInfoQuery(
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

	const { loadWorld, setUnauthorized } = worldSlice.actions
	const { loadArticles } = wikiSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		if (error) {
			dispatch(setUnauthorized(true))
		}
	}, [dispatch, error, setUnauthorized])

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
