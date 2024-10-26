import { Login, Logout } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useDispatch, useSelector } from 'react-redux'

import { usePostLogoutMutation } from '../../../../api/rheaApi'
import { appRoutes, useAppRouter } from '../../../../router/routes/appRoutes'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

export const SmallProfile = () => {
	const { navigateTo } = useAppRouter()

	const [logout, { isLoading }] = usePostLogoutMutation()
	const { user } = useSelector(getAuthState)
	const { clearUser } = authSlice.actions
	const dispatch = useDispatch()

	const onLogin = async () => {
		navigateTo({ target: appRoutes.login })
	}

	const onLogout = async () => {
		const { error } = parseApiResponse(await logout())
		if (error) {
			return
		}
		dispatch(clearUser())
		navigateTo({ target: appRoutes.login })
	}

	return (
		<LoadingButton
			loading={isLoading}
			color="secondary"
			onClick={user ? onLogout : onLogin}
			loadingPosition="start"
			startIcon={user ? <Logout /> : <Login />}
		>
			<span>{user ? 'Logout' : 'Login'}</span>
		</LoadingButton>
	)
}
