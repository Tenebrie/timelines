import { useDispatch, useSelector } from 'react-redux'

import { CreateFolderApiArg, useCreateFolderMutation, worldWikiFolderApi } from '@/api/worldWikiFolderApi'
import { AppDispatch } from '@/app/store'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

export function useCreateFolder() {
	const worldId = useSelector(getWorldIdState)
	const [createFolder, params] = useCreateFolderMutation()

	const dispatch = useDispatch<AppDispatch>()

	const commit = async (body: CreateFolderApiArg['body']) => {
		const { response, error } = parseApiResponse(
			await createFolder({
				worldId,
				body,
			}),
		)
		if (error) {
			return
		}

		dispatch(
			worldWikiFolderApi.util.updateQueryData('getFolders', { worldId }, (folders) => {
				return folders.map((folder) => {
					if (folder.id === response.id) {
						return {
							...folder,
							...response,
						}
					}
					return folder
				})
			}),
		)

		return response
	}

	return [commit, params] as const
}
