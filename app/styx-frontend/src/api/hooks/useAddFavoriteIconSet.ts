import { useAddFavoriteIconMutation } from '@api/favoriteIconsApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useAddFavoriteIconSet() {
	const [addFavoriteIconMutation, state] = useAddFavoriteIconMutation()

	const add = useCallback(
		async (iconId: string) => {
			const { response, error } = parseApiResponse(await addFavoriteIconMutation({ iconId }))
			if (error) {
				return { error }
			}
			return { response }
		},
		[addFavoriteIconMutation],
	)

	return [add, state] as const
}
