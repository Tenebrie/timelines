import { useDeleteAssetMutation } from '@api/assetApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useDeleteAsset() {
	const [deleteAssetMutation, state] = useDeleteAssetMutation()

	const deleteAsset = useCallback(
		async (assetId: string) => {
			const { response, error } = parseApiResponse(await deleteAssetMutation({ assetId }))
			if (error) {
				return { error }
			}
			return { response }
		},
		[deleteAssetMutation],
	)

	return [deleteAsset, state] as const
}
