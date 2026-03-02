import { RequestPresignedUrlApiArg, useRequestPresignedUrlMutation } from '@api/assetApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useRequestPresignedUrl() {
	const [requestPresignedUrl, status] = useRequestPresignedUrlMutation()

	const perform = useCallback(
		async (body: RequestPresignedUrlApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await requestPresignedUrl({
					body,
				}),
			)
			if (error) {
				throw error
			}
			return response
		},
		[requestPresignedUrl],
	)

	return [perform, status] as const
}
