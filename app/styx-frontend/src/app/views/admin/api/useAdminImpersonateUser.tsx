import { useAdminImpersonateUserMutation } from '@api/adminUsersApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export function useAdminImpersonateUser() {
	const navigate = useStableNavigate()
	const [impersonateUserMutation, state] = useAdminImpersonateUserMutation()

	const impersonateUser = useCallback(
		async (userId: string) => {
			const { response, error } = parseApiResponse(await impersonateUserMutation({ userId }))
			if (error) {
				return { error }
			}
			navigate({ to: '/', reloadDocument: true })
			return { response }
		},
		[impersonateUserMutation, navigate],
	)

	return [impersonateUser, state] as const
}
