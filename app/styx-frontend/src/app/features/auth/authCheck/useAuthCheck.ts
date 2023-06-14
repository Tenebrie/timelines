import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '../../../../api/rheaApi'
import { useEffectOnce } from '../../../utils/useEffectOnce'
import { appRoutes, useAppRouter } from '../../world/router'
import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

export const useAuthCheck = () => {
	const { data, error, isLoading, refetch } = useCheckAuthenticationQuery()
	const { navigateToLoginWithoutHistory, navigateToHomeWithoutHistory } = useAppRouter()

	const { user } = useSelector(getAuthState)
	const { setUser, showRheaConnectionAlert, hideRheaConnectionAlert } = authSlice.actions
	const dispatch = useDispatch()

	useEffectOnce(() => {
		const interval = window.setInterval(() => refetch(), 15000)
		return () => {
			window.clearInterval(interval)
		}
	})

	useEffect(() => {
		if (!data) {
			return
		}

		if (data.authenticated && 'user' in data) {
			dispatch(setUser(data.user))
		}
	}, [data, dispatch, setUser])

	useEffect(() => {
		if (!error) {
			dispatch(hideRheaConnectionAlert())
			return
		}

		dispatch(showRheaConnectionAlert())
	}, [dispatch, error, isLoading, showRheaConnectionAlert, hideRheaConnectionAlert])

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
