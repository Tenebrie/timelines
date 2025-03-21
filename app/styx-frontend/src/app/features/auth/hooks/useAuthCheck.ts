import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '@/api/authApi'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { authSlice } from '../AuthSlice'
import { getAuthState } from '../AuthSliceSelectors'

type ReturnType = {
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
		return { success: true }
	}

	const publicRoutes = ['/login', '/register']
	if (publicRoutes.some((r) => window.location.pathname.startsWith(r))) {
		return { success: true }
	}

	if (window.location.pathname.startsWith('/world/') && !isUnauthorized) {
		return { success: true }
	}

	if (user || (data && data.authenticated)) {
		return { success: true }
	}

	return {
		success: false,
		redirectTo: '/login',
	}
}
