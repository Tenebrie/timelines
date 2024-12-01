import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCheckAuthenticationQuery } from '@/api/authApi'
import { appRoutes } from '@/router/routes/appRoutes'

import { getWorldState } from '../../worldTimeline/selectors'
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

	if (window.location.pathname.startsWith('/world') && (!isWorldLoaded || accessMode !== 'Private')) {
		return { success: true, target: '' }
	}

	if (
		window.location.pathname === appRoutes.limbo ||
		window.location.pathname === appRoutes.login ||
		window.location.pathname === appRoutes.register
	) {
		return {
			success: true,
			target: '',
		}
	}

	return {
		success: false,
		target: appRoutes.login,
	}
}
