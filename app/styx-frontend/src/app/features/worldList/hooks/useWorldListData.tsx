import { useGetWorldsQuery } from '@api/worldListApi'

export const useWorldListData = () => {
	const { data, isFetching } = useGetWorldsQuery()

	return {
		isFetching,
		isReady: !!data,
		ownedWorlds: data?.ownedWorlds ?? [],
		contributableWorlds: data?.contributableWorlds ?? [],
		visibleWorlds: data?.visibleWorlds ?? [],
	}
}
