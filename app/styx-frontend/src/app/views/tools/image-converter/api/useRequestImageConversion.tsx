import { RequestImageConversionApiArg, useRequestImageConversionMutation } from '@api/otherApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useRequestImageConversion() {
	const [requestImageConversion, status] = useRequestImageConversionMutation()

	const perform = useCallback(
		async (body: RequestImageConversionApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await requestImageConversion({
					body,
				}),
			)
			if (error) {
				throw error
			}
			return response
		},
		[requestImageConversion],
	)

	return [perform, status] as const
}
