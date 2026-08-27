import { useRemoveFavoriteIconMutation } from '@api/favoriteIconsApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useRemoveFavoriteIconSet() {
	const [removeFavoriteIconMutation, state] = useRemoveFavoriteIconMutation()

	const remove = useCallback(
		async (iconId: string) => {
			const { response, error } = parseApiResponse(await removeFavoriteIconMutation({ iconId }))
			if (error) {
				return { error }
			}
			return { response }
		},
		[removeFavoriteIconMutation],
	)

	return [remove, state] as const
}
