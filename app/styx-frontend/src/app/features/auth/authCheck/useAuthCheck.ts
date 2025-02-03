import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '@/api/authApi'
import { appRoutes } from '@/router/routes/appRoutes'

import { getWorldState } from '../../world/selectors'
import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

type ReturnType = {
	success: boolean
	target: '' | (typeof appRoutes)[keyof typeof appRoutes]
}

export const useAuthCheck = (): ReturnType => {
	const { data, isLoading } = useCheckAuthenticationQuery()

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

	if (isLoading) {
		console.debug('Auth check successful: User details loading')
		return { success: true, target: '' }
	}

	if (user || (data && data.authenticated)) {
		return { success: true, target: '' }
	}

	if (window.location.pathname.startsWith('/world') && (!isWorldLoaded || accessMode !== 'Private')) {
		console.debug('Auth check successful: World is public or still loading')
		return { success: true, target: '' }
	}

	if (
		window.location.pathname === appRoutes.limbo ||
		window.location.pathname === appRoutes.login ||
		window.location.pathname === appRoutes.register
	) {
		console.debug('Auth check successful: Public route')
		return {
			success: true,
			target: '',
		}
	}

	console.debug('Redirecting to login')
	return {
		success: false,
		target: appRoutes.login,
	}
}
