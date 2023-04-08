import { useEffect } from 'react'

import { useCheckAuthenticationQuery } from '../../../api/rheaApi'
import { useAppRouter } from '../world/router'

export const useAuthCheck = () => {
	const { data } = useCheckAuthenticationQuery()
	const { navigateToLoginWithoutHistory } = useAppRouter()

	useEffect(() => {
		if (!data) {
			return
		}

		if (!data.authenticated) {
			navigateToLoginWithoutHistory()
		}
	}, [data, navigateToLoginWithoutHistory])
}
