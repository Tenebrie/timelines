import { UpdateProfileApiArg, useUpdateProfileMutation } from '@api/profileApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { useAuthApiCache } from './useAuthApiCache'

export const useUpdateProfile = () => {
	const [updateProfile, state] = useUpdateProfileMutation()
	const { invalidateAuthQuery, updateCachedProfile } = useAuthApiCache()

	const perform = useCallback(
		async (body: UpdateProfileApiArg['body']) => {
			updateCachedProfile(body)

			const { response, error } = parseApiResponse(
				await updateProfile({
					body,
				}),
			)
			if (error) {
				invalidateAuthQuery()
				return
			}
			return response.user
		},
		[invalidateAuthQuery, updateCachedProfile, updateProfile],
	)

	return [perform, state] as const
}
