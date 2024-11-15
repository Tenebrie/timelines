import { useGetWorldsQuery } from '@/api/worldApi'

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
