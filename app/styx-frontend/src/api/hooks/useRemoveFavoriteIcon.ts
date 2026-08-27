import { useRemoveFavoriteIconMutation } from '@api/favoriteIconsApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useRemoveFavoriteIcon() {
	const [removeFavoriteIconMutation, state] = useRemoveFavoriteIconMutation()

	const removeFavoriteIcon = useCallback(
		async (iconId: string) => {
			const { response, error } = parseApiResponse(await removeFavoriteIconMutation({ iconId }))
			if (error) {
				return { error }
			}
			return { response }
		},
		[removeFavoriteIconMutation],
	)

	return [removeFavoriteIcon, state] as const
}
