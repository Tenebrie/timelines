import { useEffect } from 'react'

import { useCheckAuthenticationQuery } from '../../../api/rheaApi'
import { appRoutes, useAppRouter } from '../world/router'

export const useAuthCheck = () => {
	const { data } = useCheckAuthenticationQuery()
	const { navigateToLoginWithoutHistory } = useAppRouter()

	useEffect(() => {
		if (!data) {
			return
		}

		if (
			!data.authenticated &&
			window.location.pathname !== appRoutes.login &&
			window.location.pathname !== appRoutes.register
		) {
			navigateToLoginWithoutHistory()
		}
	}, [data, navigateToLoginWithoutHistory])
}
