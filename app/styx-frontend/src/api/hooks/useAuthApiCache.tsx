import { authApi, CheckAuthenticationApiResponse } from '@api/authApi'
import { useDispatch } from 'react-redux'

import { User } from '@/app/features/auth/AuthSlice'
import { AppDispatch } from '@/app/store'

type UpdateCachedProfileData = Partial<Extract<CheckAuthenticationApiResponse, { user: User }>['user']>

export const useAuthApiCache = () => {
	const dispatch = useDispatch<AppDispatch>()

	const updateCachedProfile = (data: Partial<UpdateCachedProfileData>) => {
		dispatch(
			authApi.util.updateQueryData('checkAuthentication', undefined, (draft) => {
				if (!draft.authenticated || !('user' in draft)) {
					return draft
				}

				return {
					...draft,
					user: {
						...draft.user,
						...data,
					},
				}
			}),
		)
	}

	const invalidateAuthQuery = () => {
		dispatch(authApi.util.invalidateTags(['auth']))
	}

	return {
		updateCachedProfile,
		invalidateAuthQuery,
	}
}
