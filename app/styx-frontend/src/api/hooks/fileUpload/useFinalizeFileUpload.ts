import { FinalizeAssetUploadApiArg, useFinalizeAssetUploadMutation } from '@api/assetApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useFinalizeFileUpload() {
	const [finalizeAssetUpload, status] = useFinalizeAssetUploadMutation()

	const perform = useCallback(
		async (body: FinalizeAssetUploadApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await finalizeAssetUpload({
					body,
				}),
			)
			if (error) {
				throw error
			}
			return response
		},
		[finalizeAssetUpload],
	)

	return [perform, status] as const
}
