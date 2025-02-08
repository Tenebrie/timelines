import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '@/api/authApi'

import { getWorldState } from '../../world/selectors'
import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

type ReturnType = {
	isAuthenticating: boolean
	success: boolean
	redirectTo?: 'home' | 'login' | 'register' | undefined
}

export const useAuthCheck = (): ReturnType => {
	const { data, isLoading: isAuthenticating } = useCheckAuthenticationQuery()

	const { user } = useSelector(getAuthState)
	const { isLoaded: isWorldLoaded, accessMode } = useSelector(
		getWorldState,
		(a, b) => a.isLoaded === b.isLoaded && a.accessMode === b.accessMode,
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
	}, [data, dispatch, setSessionId, setUser])

	if (isAuthenticating) {
		return { isAuthenticating, success: true }
	}

	if (window.location.pathname.startsWith('/world') && (!isWorldLoaded || accessMode !== 'Private')) {
		return { isAuthenticating, success: true }
	}

	if (user || (data && data.authenticated)) {
		return { isAuthenticating, success: true }
	}

	return {
		isAuthenticating,
		success: false,
		redirectTo: 'login',
	}
}
