import { Logout } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useDispatch } from 'react-redux'

import { usePostLogoutMutation } from '../../../../api/rheaApi'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { useAppRouter } from '../../world/router'
import { authSlice } from '../reducer'

export const SmallProfile = () => {
	const { navigateToLogin } = useAppRouter()

	const [logout, { isLoading }] = usePostLogoutMutation()
	const { clearUser } = authSlice.actions
	const dispatch = useDispatch()

	const onLogout = async () => {
		const { error } = parseApiResponse(await logout())
		if (error) {
			return
		}
		dispatch(clearUser())
		navigateToLogin()
	}

	return (
		<LoadingButton
			loading={isLoading}
			color="secondary"
			onClick={onLogout}
			loadingPosition="start"
			startIcon={<Logout />}
		>
			<span>Logout</span>
		</LoadingButton>
	)
}
