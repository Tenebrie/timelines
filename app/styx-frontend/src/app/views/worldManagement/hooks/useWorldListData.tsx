import { useGetWorldsQuery } from '@api/worldListApi'
import { useSelector } from 'react-redux'

import { getAuthState } from '@/app/features/auth/AuthSliceSelectors'

export const useWorldListData = () => {
	const { user } = useSelector(getAuthState)
	const { data, isFetching, isLoading } = useGetWorldsQuery(undefined, {
		skip: !user,
		refetchOnMountOrArgChange: true,
	})

	return {
		isLoading,
		isFetching,
		isReady: !!data,
		ownedWorlds: data?.ownedWorlds ?? [],
		contributableWorlds: data?.contributableWorlds ?? [],
		visibleWorlds: data?.visibleWorlds ?? [],
	}
}
