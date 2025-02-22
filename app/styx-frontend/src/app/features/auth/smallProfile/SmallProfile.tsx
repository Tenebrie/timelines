import Login from '@mui/icons-material/Login'
import Logout from '@mui/icons-material/Logout'
import LoadingButton from '@mui/lab/LoadingButton'
import { useNavigate } from '@tanstack/react-router'
import { useDispatch, useSelector } from 'react-redux'

import { usePostLogoutMutation } from '@/api/authApi'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { authSlice } from '../reducer'
import { getAuthState } from '../selectors'

export const SmallProfile = () => {
	const navigate = useNavigate()

	const [logout, { isLoading }] = usePostLogoutMutation()
	const { user } = useSelector(getAuthState)
	const { clearUser } = authSlice.actions
	const dispatch = useDispatch()

	const onLogin = async () => {
		navigate({ to: '/login' })
	}

	const onLogout = async () => {
		const { error } = parseApiResponse(await logout())
		if (error) {
			return
		}
		dispatch(clearUser())
		navigate({ to: '/login' })
	}

	return (
		<LoadingButton
			loading={isLoading}
			color="secondary"
			onClick={user ? onLogout : onLogin}
			loadingPosition="start"
			startIcon={user ? <Logout /> : <Login />}
		>
			<span style={{ minWidth: '58px' }}>{user ? 'Sign Out' : 'Sign In'}</span>
		</LoadingButton>
	)
}
