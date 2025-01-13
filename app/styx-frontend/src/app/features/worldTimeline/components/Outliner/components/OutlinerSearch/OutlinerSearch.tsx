import { useSearchWorldQuery } from '@api/worldSearchApi'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { SearchInput } from '@/app/components/SearchInput'
import { worldSlice } from '@/app/features/worldTimeline/reducer'
import { getWorldIdState } from '@/app/features/worldTimeline/selectors'
import { ingestEvent } from '@/app/utils/ingestEvent'

export const OutlinerSearch = () => {
	const worldId = useSelector(getWorldIdState)
	const worldIdRef = useRef(worldId)

	const [searchValue, setSearchValue] = useState('')

	const { data, isLoading } = useSearchWorldQuery({ worldId, query: searchValue }, { skip: !searchValue })

	const { setSearchResults, setSearchLoading, cancelSearch } = worldSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setSearchLoading(isLoading))
	}, [dispatch, isLoading, setSearchLoading])

	useEffect(() => {
		setSearchValue('')
		dispatch(cancelSearch())
		worldIdRef.current = worldId
	}, [cancelSearch, dispatch, worldId])

	useEffect(() => {
		if (!searchValue) {
			dispatch(cancelSearch())
		}
	}, [cancelSearch, dispatch, searchValue])

	useEffect(() => {
		if (!data) {
			return
		}

		dispatch(
			setSearchResults({
				query: searchValue,
				results: {
					actors: data.actors,
					events: data.events.map((event) => ingestEvent(event)),
				},
			}),
		)
	}, [data, dispatch, setSearchResults, searchValue])

	return <SearchInput onChange={setSearchValue} />
}
