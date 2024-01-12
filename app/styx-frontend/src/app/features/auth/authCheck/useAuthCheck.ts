import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '../../../../api/rheaApi'
import { appRoutes } from '../../../../router/routes/appRoutes'
import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

type ReturnType = {
	success: boolean
	target: '' | (typeof appRoutes)[keyof typeof appRoutes]
}

export const useAuthCheck = (): ReturnType => {
	const { data, isLoading } = useCheckAuthenticationQuery()

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

	if (user || (data && data.authenticated) || isLoading) {
		return { success: true, target: '' }
	}

	if (
		window.location.pathname !== appRoutes.limbo &&
		window.location.pathname !== appRoutes.login &&
		window.location.pathname !== appRoutes.register
	) {
		return {
			success: false,
			target: appRoutes.login,
		}
	}

	return {
		success: true,
		target: '',
	}
}
