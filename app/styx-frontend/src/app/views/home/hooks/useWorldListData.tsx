import { useGetWorldsQuery } from '@api/worldListApi'
import { useSelector } from 'react-redux'

import { getAuthState } from '@/app/features/auth/selectors'

export const useWorldListData = () => {
	const { user } = useSelector(getAuthState)
	const { data, isFetching } = useGetWorldsQuery(undefined, {
		skip: !user,
	})

	return {
		isFetching,
		isReady: !!data,
		ownedWorlds: data?.ownedWorlds ?? [],
		contributableWorlds: data?.contributableWorlds ?? [],
		visibleWorlds: data?.visibleWorlds ?? [],
	}
}
