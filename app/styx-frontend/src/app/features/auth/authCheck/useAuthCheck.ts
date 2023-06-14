import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '../../../../api/rheaApi'
import { appRoutes, useAppRouter } from '../../world/router'
import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

export const useAuthCheck = () => {
	const { data, isLoading } = useCheckAuthenticationQuery()
	const { navigateToLoginWithoutHistory, navigateToHomeWithoutHistory } = useAppRouter()

	const { user } = useSelector(getAuthState)
	const { setUser } = authSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		if (!data) {
			return
		}

		if (data.authenticated && 'user' in data) {
			dispatch(setUser(data.user))
		}
	}, [data, dispatch, setUser])

	useEffect(() => {
		if (user || (data && data.authenticated) || isLoading) {
			return
		}

		if (
			window.location.pathname !== appRoutes.limbo &&
			window.location.pathname !== appRoutes.login &&
			window.location.pathname !== appRoutes.register
		) {
			navigateToLoginWithoutHistory()
		}
	}, [user, isLoading, navigateToHomeWithoutHistory, navigateToLoginWithoutHistory, data])
}
