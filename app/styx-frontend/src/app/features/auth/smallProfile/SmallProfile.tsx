import { Logout } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useDispatch } from 'react-redux'

import { usePostLogoutMutation } from '../../../../api/rheaApi'
import { appRoutes, useAppRouter } from '../../../../router/routes/appRoutes'
import { parseApiResponse } from '../../../utils/parseApiResponse'
import { authSlice } from '../reducer'

export const SmallProfile = () => {
	const { navigateTo } = useAppRouter()

	const [logout, { isLoading }] = usePostLogoutMutation()
	const { clearUser } = authSlice.actions
	const dispatch = useDispatch()

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
			onClick={onLogout}
			loadingPosition="start"
			startIcon={<Logout />}
		>
			<span>Logout</span>
		</LoadingButton>
	)
}
