import { AdminUpdateUserApiArg, useAdminUpdateUserMutation } from '@api/adminUsersApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useAdminUpdateUser() {
	const [updateUserMutation, state] = useAdminUpdateUserMutation()

	const updateUser = useCallback(
		async (userId: string, body: AdminUpdateUserApiArg['body']) => {
			const { response, error } = parseApiResponse(await updateUserMutation({ userId, body }))
			if (error) {
				return { error }
			}
			return { response }
		},
		[updateUserMutation],
	)

	return [updateUser, state] as const
}
