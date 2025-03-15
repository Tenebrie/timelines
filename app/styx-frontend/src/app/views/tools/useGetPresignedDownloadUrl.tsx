import { useLazyGetAssetQuery } from '@api/otherApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useGetPresignedDownloadUrl() {
	const [getPresignedDownloadUrl, status] = useLazyGetAssetQuery()

	const perform = useCallback(
		async (assetId: string) => {
			const { response, error } = parseApiResponse(await getPresignedDownloadUrl({ assetId }))
			if (error) {
				throw error
			}
			return response
		},
		[getPresignedDownloadUrl],
	)

	return [perform, status] as const
}
