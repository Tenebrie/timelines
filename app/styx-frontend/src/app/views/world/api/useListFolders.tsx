import { useGetFoldersQuery } from '@api/worldWikiFolderApi'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useListFolders() {
	const worldId = useSelector(getWorldIdState)
	return useGetFoldersQuery(
		{ worldId },
		{
			skip: !worldId,
		},
	)
}
