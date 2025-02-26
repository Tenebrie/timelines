import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '@/api/authApi'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

type ReturnType = {
	isAuthenticating: boolean
	success: boolean
	redirectTo?: '/home' | '/login' | '/register' | undefined
}

export const useAuthCheck = (): ReturnType => {
	const { data, error, isLoading: isAuthenticating } = useCheckAuthenticationQuery()

	const { user } = useSelector(getAuthState)
	const { isUnauthorized } = useSelector(
		getWorldState,
		(a, b) =>
			a.isLoaded === b.isLoaded && a.accessMode === b.accessMode && a.isUnauthorized === b.isUnauthorized,
	)
	const { setUser, setSessionId } = authSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		if (!data) {
			return
		}

		dispatch(setSessionId(data.sessionId))
		if (data.authenticated && 'user' in data) {
			dispatch(setUser(data.user))
		}
	}, [data, error, dispatch, setSessionId, setUser])

	if (isAuthenticating) {
		return { isAuthenticating, success: true }
	}

	const publicRoutes = ['/login', '/register']
	if (publicRoutes.some((r) => window.location.pathname.startsWith(r))) {
		return { isAuthenticating, success: true }
	}

	if (!user && data && !data.authenticated) {
		return { isAuthenticating, success: false, redirectTo: '/login' }
	}

	if (isUnauthorized) {
		return { isAuthenticating, success: false, redirectTo: '/home' }
	}

	if (user || (data && data.authenticated)) {
		return { isAuthenticating, success: true }
	}

	return {
		isAuthenticating,
		success: false,
		redirectTo: '/login',
	}
}
