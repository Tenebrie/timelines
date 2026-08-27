import { useAddFavoriteIconMutation } from '@api/favoriteIconsApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useAddFavoriteIcon() {
	const [addFavoriteIconMutation, state] = useAddFavoriteIconMutation()

	const addFavoriteIcon = useCallback(
		async (iconId: string) => {
			const { response, error } = parseApiResponse(await addFavoriteIconMutation({ iconId }))
			if (error) {
				return { error }
			}
			return { response }
		},
		[addFavoriteIconMutation],
	)

	return [addFavoriteIcon, state] as const
}
