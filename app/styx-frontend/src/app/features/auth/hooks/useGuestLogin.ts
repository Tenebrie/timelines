import { useCreateGuestAccountMutation } from '@api/authApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { getAuthState } from '../AuthSliceSelectors'
import { useHandleUserLogin } from './useHandleUserLogin'

export function useGuestLogin() {
	const navigate = useStableNavigate()
	const handleUserLogin = useHandleUserLogin()
	const { user } = useSelector(getAuthState)

	const [createGuest, state] = useCreateGuestAccountMutation()

	const commit = async () => {
		if (user) {
			navigate({ to: '/' })
			return
		}

		const result = parseApiResponse(await createGuest())

		if (result.error) {
			return
		}

		handleUserLogin(result.response)
	}

	return [commit, state] as const
}
